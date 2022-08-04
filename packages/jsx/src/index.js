import { createHash } from 'node:crypto'
import path from 'node:path'
import { createFilter } from 'vite'
import { parse } from '@babel/parser'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'

/**
 * @type {import('.').whyframeJsx}
 */
export function whyframeJsx(options) {
  const virtualIdToCode = new Map()
  // secondary map to track stale virtual ids on hot update
  const jsxIdToVirtualIds = new Map()
  /** @type {import('@whyframe/core').Api} */
  let whyframeApi

  const filter = createFilter(options?.include || /\.[jt]sx$/, options?.exclude)

  return {
    name: 'whyframe:jsx',
    enforce: 'pre',
    configResolved(c) {
      whyframeApi = c.plugins.find((p) => p.name === 'whyframe:api')?.api
      if (!whyframeApi) {
        // TODO: maybe fail safe
        throw new Error('whyframe() plugin is not installed')
      }
    },
    transform(code, id) {
      if (!filter(id) || id.includes('-whyframe-')) return

      const isTs = path.extname(id).startsWith('.t')
      const ctx = this

      // parse instances of `<iframe why></iframe>` and extract them out as a virtual import
      const s = new MagicString(code)

      /** @type {import('@babel/parser').ParserPlugin[]} */
      const plugins = [
        'jsx',
        'importMeta',
        // This plugin is applied before esbuild transforms the code,
        // so we need to enable some stage 3 syntax that is supported in
        // TypeScript and some environments already.
        'topLevelAwait',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods'
      ]

      if (isTs) {
        plugins.push('typescript')
      }

      // TODO: look into swc
      const ast = parse(code, {
        sourceType: 'module',
        plugins
      })

      /** @type {string[]} */
      const virtualIds = []

      let topLevelFnNode
      let isExport

      walk(ast, {
        leave(node) {
          if (
            node.type === 'FunctionDeclaration' ||
            node.type === 'ArrowFunctionExpression'
          ) {
            topLevelFnNode = null
            isExport = null
          }
        },
        enter(node, parent) {
          if (
            node.type === 'FunctionDeclaration' ||
            node.type === 'ArrowFunctionExpression'
          ) {
            // nested
            if (topLevelFnNode) {
              this.skip()
            } else {
              topLevelFnNode = node
              if (
                parent.type === 'ExportNamedDeclaration' ||
                parent.type === 'ExportDefaultDeclaration'
              ) {
                isExport = parent
              }
            }
            return
          }

          // only detect jsx in fn
          if (
            topLevelFnNode &&
            node.type === 'JSXElement' &&
            node.openingElement.name.name === 'iframe' &&
            node.openingElement.attributes.some(
              (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'why'
            ) &&
            node.children.length > 0
          ) {
            // extract iframe html
            const iframeContentStart = node.children[0].start
            const iframeContentEnd = node.children[node.children.length - 1].end
            const iframeContent = code.slice(
              iframeContentStart,
              iframeContentEnd
            )
            s.remove(iframeContentStart, iframeContentEnd)

            const outScope = isExport || topLevelFnNode
            // crawl out of fn, get top to fn start
            const topCode = code.slice(0, outScope.start)
            // crawl out of fn, get fn end to bottom
            const bottomCode = code.slice(outScope.end)
            // crawl to fn body, get body start to jsx
            const fnBody = topLevelFnNode.body.body
            const returnStatement = fnBody.findIndex(
              (c) =>
                c.type === 'ReturnStatement' &&
                astContainsNode(c.argument, node)
            )
            if (returnStatement === -1) {
              this.skip()
              return
            }
            const fnCode =
              returnStatement > 0
                ? code.slice(fnBody[0].start, fnBody[returnStatement - 1].end)
                : ''
            const virtualComponentCode = `\
${topCode}
export function WhyframeApp() {
  ${fnCode}
  return (
    <>
      ${iframeContent}
    </>
  )
}
${bottomCode}`

            // derive final hash per iframe
            const finalHash = getHash(virtualComponentCode)

            // get iframe src
            // TODO: unify special treatment for why-template somewhere
            const customTemplateKey = node.openingElement.attributes.find(
              (a) => a.name.name === 'whyTemplate'
            )?.value.value
            const virtualEntry = `whyframe:entry-${finalHash}.jsx`
            const virtualComponent = `${id}-whyframe-${finalHash}.jsx`
            const iframeSrc = whyframeApi.getIframeSrc(customTemplateKey)
            const iframeOnLoad = whyframeApi.getIframeLoadHandler(virtualEntry, ctx)

            virtualIds.push(virtualEntry, virtualComponent)

            s.appendLeft(
              node.start + `<iframe`.length,
              ` src="${iframeSrc}" onLoad={${iframeOnLoad}}`
            )

            virtualIdToCode.set(
              virtualEntry,
              createEntry(virtualComponent, options.framework)
            )
            // TODO: better sourcemaps
            virtualIdToCode.set(virtualComponent, virtualComponentCode)
          }
        }
      })

      // save virtual imports for invalidation when file updates
      jsxIdToVirtualIds.set(id, virtualIds)

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      }
    },
    resolveId(id) {
      if (id.startsWith('whyframe:entry')) {
        return '\0' + id
      }
      // TODO: something more sane
      if (id.includes('-whyframe-')) {
        // NOTE: this gets double resolved for some reason
        if (id.startsWith(process.cwd())) {
          return id
        } else {
          return path.join(process.cwd(), id)
        }
      }
    },
    load(id) {
      if (id.startsWith('\0whyframe:entry')) {
        return virtualIdToCode.get(id.slice(1))
      }
      if (id.includes('-whyframe-')) {
        return {
          code: virtualIdToCode.get(id),
          map: { mappings: '' }
        }
      }
    },
    handleHotUpdate({ file }) {
      // Remove stale virtual ids
      // NOTE: hot update always come first before transform
      if (jsxIdToVirtualIds.has(file)) {
        const staleVirtualIds = jsxIdToVirtualIds.get(file)
        for (const id of staleVirtualIds) {
          virtualIdToCode.delete(id)
        }
      }
    }
  }
}

function getHash(text) {
  return createHash('sha256').update(text).digest('hex').substring(0, 8)
}

/**
 * @param {string} virtualComponent
 * @param {import('.').Options['framework']} framework
 */
function createEntry(virtualComponent, framework) {
  switch (framework) {
    case 'react':
      return `\
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WhyframeApp } from '${virtualComponent}'

export function createInternalApp(el) {
  ReactDOM.createRoot(el).render(<WhyframeApp />)
}`
    case 'preact':
      return `\
import { render } from 'preact'
import { WhyframeApp } from '${virtualComponent}'

export function createInternalApp(el) {
  render(<WhyframeApp />, el)
}`
    case 'solid':
      return `\
import { render } from 'solid-js/web'
import { WhyframeApp } from '${virtualComponent}'

export function createInternalApp(el) {
  render(() => <WhyframeApp />, el)
}`
  }
}

// TODO: optimize
function astContainsNode(ast, node) {
  let found = false
  walk(ast, {
    enter(n) {
      if (node === n) {
        found = true
        this.skip()
      }
    }
  })
  return found
}
