import path from 'node:path'
import { createFilter } from 'vite'
import { parse } from '@babel/parser'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { dedent, hash } from '@whyframe/core/pluginutils'

/**
 * @type {import('.').whyframeJsx}
 */
export function whyframeJsx(options) {
  /** @type {import('@whyframe/core').Api} */
  let api

  const filter = createFilter(options?.include || /\.[jt]sx$/, options?.exclude)
  const componentNames = options?.components?.map((c) => c.name) ?? []
  const componentPaths =
    options?.components?.flatMap((c) => [c.path, path.resolve(c.path)]) ?? []

  function componentPathToExport(p) {
    return options?.components?.find(
      (c) => c.path === p || path.resolve(c.path) === p
    )?.export
  }

  return {
    name: 'whyframe:jsx',
    enforce: 'pre',
    configResolved(c) {
      api = c.plugins.find((p) => p.name === 'whyframe:api')?.api
      if (!api) {
        // TODO: maybe fail safe
        throw new Error('whyframe() plugin is not installed')
      }
    },
    transform(code, id) {
      if (!filter(id)) return
      if (!api.moduleMayHaveIframe(id, code)) return

      const isProxyMode = componentPaths.includes(id)
      const proxyExport = isProxyMode ? componentPathToExport(id) : null

      const ext = path.extname(id)

      // parse instances of `<iframe data-why></iframe>` and extract them out as a virtual import
      const s = new MagicString(code)

      /** @type {import('@babel/parser').ParserPlugin[]} */
      const parserPlugins = [
        // NOTE: got `(intermediate value) is not iterable` error if spread without fallback empty array
        ...(options.parserOptions?.plugins ?? []),
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
      if (ext.startsWith('.t')) {
        parserPlugins.push('typescript')
      }

      const ast = parse(code, {
        ...options.parserOptions,
        sourceType: 'module',
        allowAwaitOutsideFunction: true,
        plugins: parserPlugins
      })

      /** @type {import('estree-walker').BaseNode | null} */
      let topLevelFnNode = null
      /** @type {import('estree-walker').BaseNode | null} */
      let exportNode = null

      walk(ast, {
        leave(node) {
          if (
            node.type === 'FunctionDeclaration' ||
            node.type === 'ArrowFunctionExpression'
          ) {
            topLevelFnNode = null
            exportNode = null
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
                exportNode = parent
              }
            }
            return
          }

          // only detect jsx in fn
          if (!topLevelFnNode) return

          // proxy mode happens on per function basis that is exported, not per file
          const isActualProxyMode =
            isProxyMode &&
            (proxyExport === 'default'
              ? exportNode?.type === 'ExportDefaultDeclaration'
              : topLevelFnNode.id?.name === proxyExport)

          const isIframeElement =
            node.type === 'JSXElement' &&
            node.openingElement.name.name === 'iframe' &&
            node.openingElement.attributes.some(
              (attr) =>
                attr.type === 'JSXAttribute' && attr.name.name === 'data-why'
            )

          if (isActualProxyMode) {
            if (isIframeElement) {
              const attrs = api.getProxyIframeAttrs()
              s.appendLeft(node.start + `<iframe`.length, stringifyAttrs(attrs))
              this.skip()
            }
            return
          }

          const isIframeComponent =
            node.type === 'JSXElement' &&
            api.isIframeComponent(node.openingElement.name.name)

          if (isIframeElement || isIframeComponent) {
            // extract iframe html
            let iframeContent = ''
            if (node.children.length > 0) {
              const start = node.children[0].start
              const end = node.children[node.children.length - 1].end
              iframeContent = code.slice(start, end)
              s.remove(start, end)
            }

            // ====== start: extract outer code
            const outScope = exportNode || topLevelFnNode
            // crawl out of fn, get top to fn start
            const topCode = code.slice(0, outScope.start)
            // crawl out of fn, get fn end to bottom
            const bottomCode = code.slice(outScope.end)
            // crawl to fn body, get body start to jsx
            const fnBody = topLevelFnNode.body.body
            // get return statement that contains tihs iframe node
            const returnStatement = fnBody.findIndex(
              (c) =>
                c.type === 'ReturnStatement' &&
                astContainsNode(c.argument, node)
            )
            if (returnStatement === -1) {
              this.skip()
              return
            }
            // get the relevant fn code from the body to the return statement
            const fnCode =
              returnStatement > 0
                ? code.slice(fnBody[0].start, fnBody[returnStatement - 1].end)
                : ''
            // ====== end: extract outer code

            // derive final hash per iframe
            const finalHash = hash(
              topCode + bottomCode + fnCode + iframeContent
            )

            const entryComponentId = api.createEntryComponent(
              id,
              finalHash,
              ext,
              `\
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
            )

            const entryId = api.createEntry(
              id,
              finalHash,
              '.jsx',
              createEntry(entryComponentId, options.framework)
            )

            // inject template props
            const templatePropName = isIframeComponent
              ? 'whyTemplate'
              : 'data-why-template'
            const templateName = node.openingElement.attributes.find(
              (a) => a.name.name === templatePropName
            )?.value.value
            const attrs = api.getMainIframeAttrs(
              entryId,
              finalHash,
              templateName,
              dedent(iframeContent),
              isIframeComponent
            )
            s.appendLeft(
              node.start + node.openingElement.name.name.length + 1,
              stringifyAttrs(attrs)
            )
          }
        }
      })

      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: s.generateMap({ hires: true })
        }
      }
    }
  }
}

/**
 * @param {string} entryId
 * @param {import('.').Options['framework']} framework
 */
function createEntry(entryId, framework) {
  switch (framework) {
    case 'react':
      return `\
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WhyframeApp } from '${entryId}'

export function createApp(el) {
  ReactDOM.createRoot(el).render(<WhyframeApp />)
}`
    case 'preact':
      return `\
import { render } from 'preact'
import { WhyframeApp } from '${entryId}'

export function createApp(el) {
  render(<WhyframeApp />, el)
}`
    case 'solid':
      return `\
import { render } from 'solid-js/web'
import { WhyframeApp } from '${entryId}'

export function createApp(el) {
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

/**
 * @param {import('@whyframe/core').Attr[]} attrs
 */
function stringifyAttrs(attrs) {
  let str = ''
  for (const attr of attrs) {
    if (attr.type === 'static') {
      str += ` ${attr.name}=${JSON.stringify(attr.value)}`
    } else {
      str += ` ${attr.name}={arguments[0].${attr.value}}`
    }
  }
  return str
}
