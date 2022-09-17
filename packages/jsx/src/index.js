import fs from 'node:fs'
import path from 'node:path'
import { createFilter } from 'vite'
import { parse } from '@babel/parser'
import t from '@babel/types'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { dedent, hash } from '@whyframe/core/pluginutils'

/**
 * @type {import('..').whyframeJsx}
 */
export function whyframeJsx(options) {
  /** @type {import('@whyframe/core').Api} */
  let api

  const filter = createFilter(options?.include || /\.[jt]sx$/, options?.exclude)
  const fallbackFramework =
    options?.defaultFramework || guessFrameworkFromTsconfig()

  /** @type {import('vite').Plugin} */
  const plugin = {
    name: 'whyframe:jsx',
    enforce: 'pre',
    configResolved(c) {
      api = c.plugins.find((p) => p.name === 'whyframe:api')?.api
      if (!api) {
        // TODO: maybe fail safe
        throw new Error('whyframe() plugin is not installed')
      }

      // run our plugin before astro's
      const astro = c.plugins.findIndex((p) => p.name === 'astro:jsx')
      if (astro !== -1) {
        const myIndex = c.plugins.findIndex((p) => p.name === 'whyframe:jsx')
        if (myIndex !== -1) {
          // @ts-ignore-error hack
          c.plugins.splice(myIndex, 1)
          // @ts-ignore-error hack
          c.plugins.splice(astro, 0, plugin)
          delete plugin.enforce
        }
      }
    },
    transform(code, id) {
      if (!filter(id)) return
      if (!api.moduleMayHaveIframe(id, code)) return

      const ext = path.extname(id)

      const moduleFallbackFramework =
        validateFramework(code.match(/@jsxImportSource\s*(\S+)/)?.[1]) ||
        fallbackFramework

      // parse instances of `<iframe data-why></iframe>` and extract them out as a virtual import
      const s = new MagicString(code)

      /** @type {import('@babel/parser').ParserPlugin[]} */
      const parserPlugins = [
        // NOTE: got `(intermediate value) is not iterable` error if spread without fallback empty array
        ...(options?.parserOptions?.plugins ?? []),
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
        ...options?.parserOptions,
        sourceType: 'module',
        allowAwaitOutsideFunction: true,
        plugins: parserPlugins
      })

      for (const b of ast.program.body) {
        /** @type {import('@babel/types').FunctionDeclaration} */
        let topLevelFnNode
        /** @type {import('@babel/types').ExportNamedDeclaration | import('@babel/types').ExportDefaultDeclaration | null} */
        let exportNode = null

        if (t.isFunctionDeclaration(b)) {
          topLevelFnNode = b
        } else if (
          (t.isExportNamedDeclaration(b) || t.isExportDefaultDeclaration(b)) &&
          b.declaration?.type === 'FunctionDeclaration'
        ) {
          topLevelFnNode = b.declaration
          exportNode = b
        } else {
          continue
        }

        // @ts-expect-error
        walk(b, {
          enter(node) {
            if (!t.isJSXElement(node)) return

            const isIframeElement =
              node.type === 'JSXElement' &&
              node.openingElement.name['name'] === 'iframe' &&
              node.openingElement.attributes.some(
                (attr) =>
                  attr.type === 'JSXAttribute' && attr.name.name === 'data-why'
              )

            /** @type {import('..').Options['defaultFramework']} */
            let framework = moduleFallbackFramework

            if (isIframeElement) {
              // if contains children, it implies that it's accepting the component's
              // children as iframe content, we need to proxy them
              if (
                node.children?.some((c) =>
                  /(\{|\.)children\}$/.test(
                    code.slice(c.start ?? 0, c.end ?? 0)
                  )
                )
              ) {
                const attrs = api.getProxyIframeAttrs()
                addAttrs(s, node, attrs)
                s.remove(
                  node.children[0].start ?? 0,
                  node.children[node.children.length - 1].end ?? 0
                )
                this.skip()
                return
              }

              // if iframe element has value for framework to render via
              // `data-why="<framework>"` take highest priority
              framework =
                node.openingElement.attributes.find(
                  (attr) =>
                    t.isJSXAttribute(attr) && attr.name.name === 'data-why'
                )?.['value']?.value || framework
            }

            const iframeComponent =
              node.type === 'JSXElement' &&
              api.getComponent(node.openingElement.name['name'])

            if (isIframeElement || iframeComponent) {
              if (!framework) {
                console.warn(
                  `Unable to determine JSX framework for "${id}". ` +
                    `Fix this by specifying a fallback framework in whyframeJsx's defaultFramework option. ` +
                    `Skipping whyframe transform.`
                )
                this.skip()
                return
              }

              // extract iframe html
              let iframeContent = ''
              if (node.children.length > 0) {
                const start = node.children[0].start ?? 0
                const end = node.children[node.children.length - 1].end ?? 0
                iframeContent = code.slice(start, end)
                s.remove(start, end)
              }

              // ====== start: extract outer code
              const outScope = exportNode || topLevelFnNode
              // crawl out of fn, get top to fn start
              const topCode = code.slice(0, outScope.start ?? 0)
              // crawl out of fn, get fn end to bottom
              const bottomCode = code.slice(outScope.end ?? 0)
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
                  ? code.slice(
                      fnBody[0].start ?? 0,
                      fnBody[returnStatement - 1].end ?? 0
                    )
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
                createEntry(entryComponentId, framework)
              )

              let showSource = api.getDefaultShowSource()
              if (isIframeElement) {
                const attr =
                  /** @type {import('@babel/types').JSXAttribute | undefined} */ (
                    node.openingElement.attributes.find(
                      (p) =>
                        t.isJSXAttribute(p) &&
                        p.name.name === 'data-why-show-source'
                    )
                  )
                if (attr) {
                  if (attr.value === null) {
                    showSource = true
                  } else if (attr.value?.['value']) {
                    showSource = attr.value['value'] === 'true'
                  } else if (attr.value?.['expression']) {
                    showSource = attr.value['expression'].value === true
                  }
                }
              } else if (iframeComponent) {
                if (typeof iframeComponent.showSource === 'boolean') {
                  showSource = iframeComponent.showSource
                } else if (typeof iframeComponent.showSource === 'function') {
                  const openTag = code.slice(
                    node.openingElement.start ?? 0,
                    node.openingElement.end ?? 0
                  )
                  showSource = iframeComponent.showSource(openTag)
                }
              }

              // inject props
              const attrs = api.getMainIframeAttrs(
                entryId,
                finalHash,
                showSource ? dedent(iframeContent) : undefined,
                !!iframeComponent
              )
              addAttrs(s, node, attrs)
            }
          }
        })
      }

      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: s.generateMap({ hires: true })
        }
      }
    }
  }

  return plugin
}

/**
 * @return {import('..').Options['defaultFramework'] | undefined}
 */
function guessFrameworkFromTsconfig() {
  for (const file of ['tsconfig.json', 'jsconfig.json']) {
    try {
      const tsconfig = fs.readFileSync(path.join(process.cwd(), file), 'utf8')
      const source = tsconfig.match(/"jsxImportSource":\s*"(.*?)"/)?.[1]
      return validateFramework(source)
    } catch {}
  }
}

/**
 * @param {any} framework
 * @return {import('..').Options['defaultFramework'] | undefined}
 */
function validateFramework(framework) {
  if (framework === 'solid-js') {
    return 'solid'
  } else if (framework === 'preact') {
    return 'preact'
  } else if (framework === 'react') {
    return 'react'
  }
}

/**
 * @param {string} entryId
 * @param {import('..').Options['defaultFramework']} framework
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
  return {
    destroy: () => ReactDOM.createRoot(el).unmount()
  }
}`
    case 'preact':
      return `\
import { render } from 'preact'
import { WhyframeApp } from '${entryId}'

export function createApp(el) {
  render(<WhyframeApp />, el)
  return {
    destroy: () => render(null, el)
  }
}`
    case 'solid':
      return `\
import { render } from 'solid-js/web'
import { WhyframeApp } from '${entryId}'

export function createApp(el) {
  const destroy = render(() => <WhyframeApp />, el)
  return { destroy }
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
 * @param {MagicString} s
 * @param {any} node
 * @param {import('@whyframe/core').Attr[]} attrs
 */
function addAttrs(s, node, attrs) {
  const attrNames = node.openingElement.attributes.map((a) => a.name.name)

  const safeAttrs = []
  const mixedAttrs = []
  for (const attr of attrs) {
    if (attrNames.includes(attr.name)) {
      mixedAttrs.push(attr)
    } else {
      safeAttrs.push(attr)
    }
  }

  s.appendLeft(
    node.start + node.openingElement.name.name.length + 1,
    safeAttrs.map((a) => ` ${a.name}={${parseAttrToString(a)}}`).join('')
  )

  for (const attr of mixedAttrs) {
    const attrNode = node.openingElement.attributes.find(
      (a) => a.name.name === attr.name
    )
    if (!attrNode) continue
    const valueNode = attrNode.value
    if (!valueNode) continue

    if (valueNode.type === 'JSXExpressionContainer') {
      // foo={foo && bar} -> foo={(foo && bar) || "fallback"}
      const expression = s.original.slice(
        valueNode.start + 1,
        valueNode.end - 1
      )
      s.overwrite(
        valueNode.start,
        valueNode.end,
        `{(${expression}) || ${parseAttrToString(attr)}}`
      )
    }
  }
}

/**
 * @param {import('@whyframe/core').Attr} attr
 */
function parseAttrToString(attr) {
  if (attr.type === 'dynamic' && typeof attr.value === 'string') {
    return `arguments[0].${attr.value}`
  } else {
    return JSON.stringify(attr.value)
  }
}
