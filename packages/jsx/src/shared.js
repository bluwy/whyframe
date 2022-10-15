import fs from 'node:fs'
import path from 'node:path'
import { parse } from '@babel/parser'
import t from '@babel/types'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { dedent, hash } from '@whyframe/core/pluginutils'

/**
 * @typedef {{
 *   fallbackFramework?: import('..').Options['defaultFramework'],
 *   parserOptions?: import('..').Options['parserOptions']
 * }} TransformOptions
 */

/**
 * @param {string} code
 * @param {string} id
 * @param {import('@whyframe/core').Api} api
 * @param {TransformOptions} [options]
 */
export function transform(code, id, api, options) {
  if (!api.moduleMayHaveIframe(id, code)) return

  const ext = path.extname(id)

  const moduleFallbackFramework =
    validateImportSource(code.match(/@jsxImportSource\s*(\S+)/)?.[1]) ||
    options?.fallbackFramework

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
    /** @type {import('@babel/types').FunctionDeclaration | import('@babel/types').FunctionExpression | import('@babel/types').ArrowFunctionExpression | undefined} */
    let functionNode = getFunctionNode(b)
    let variableNode = t.isVariableDeclaration(b) ? b : undefined
    /** @type {import('@babel/types').ExportNamedDeclaration | import('@babel/types').ExportDefaultDeclaration | null} */
    let exportNode = null

    if (
      !functionNode &&
      (t.isExportNamedDeclaration(b) || t.isExportDefaultDeclaration(b))
    ) {
      functionNode = getFunctionNode(b.declaration)
      variableNode = t.isVariableDeclaration(b.declaration)
        ? b.declaration
        : undefined
      exportNode = b
    }

    if (!functionNode) continue

    /** @type {NonNullable<typeof functionNode>} */
    const fnNode = functionNode

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
              /(\{|\.)children\}$/.test(code.slice(c.start ?? 0, c.end ?? 0))
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
              (attr) => t.isJSXAttribute(attr) && attr.name.name === 'data-why'
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
          const outScope = exportNode || variableNode || fnNode
          // crawl out of fn, get top to fn start
          const topCode = code.slice(0, outScope.start ?? 0)
          // crawl out of fn, get fn end to bottom
          const bottomCode = code.slice(outScope.end ?? 0)
          const fnCode = getFunctionCode(fnNode, node, code)
          if (fnCode == null) {
            this.skip()
            return
          }
          const topLevelFnName =
            // @ts-ignore
            fnNode.id?.name ??
            // @ts-ignore
            variableNode?.declarations?.[0]?.id?.name ??
            // @ts-ignore
            exportNode?.declaration?.declarations?.[0]?.id?.name
          // ====== end: extract outer code

          // derive final hash per iframe
          const finalHash = hash(
            topCode + bottomCode + fnCode + topLevelFnName + iframeContent
          )

          const entryComponentId = api.createEntryComponent(
            id,
            finalHash,
            ext.startsWith('.md') ? '.jsx' : ext,
            `\
${topCode}
${
  topLevelFnName
    ? variableNode
      ? `${variableNode.kind} ${topLevelFnName} = function(){}`
      : `function ${topLevelFnName}(){}`
    : ''
}
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

/**
 * @return {import('..').Options['defaultFramework'] | undefined}
 */
export function guessFrameworkFromTsconfig() {
  for (const file of ['tsconfig.json', 'jsconfig.json']) {
    try {
      const tsconfig = fs.readFileSync(path.join(process.cwd(), file), 'utf8')
      const source = tsconfig.match(/"jsxImportSource":\s*"(.*?)"/)?.[1]
      return validateImportSource(source)
    } catch {}
  }
}

/**
 * @param {any} framework
 * @return {import('..').Options['defaultFramework'] | undefined}
 */
function validateImportSource(framework) {
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
    case 'react17':
      return `\
import React from 'react'
import ReactDOM from 'react-dom'
import { WhyframeApp } from '${entryId}'

export function createApp(el) {
  ReactDOM.render(<WhyframeApp />, el)
  return {
    destroy: () => ReactDOM.unmountComponentAtNode(el)
  }
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
export function addAttrs(s, node, attrs) {
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
export function parseAttrToString(attr) {
  if (attr.type === 'dynamic' && typeof attr.value === 'string') {
    return `arguments[0].${attr.value}`
  } else {
    return JSON.stringify(attr.value)
  }
}

/**
 * @param {object} b
 */
function getFunctionNode(b) {
  // function Hello() {}
  if (t.isFunctionDeclaration(b)) {
    return b
  }
  // const Hello = () => {}
  // const Hello = function() {}
  // const Hello = () => (<div></div>)
  else if (
    t.isVariableDeclaration(b) &&
    (t.isArrowFunctionExpression(b.declarations[0]?.init) ||
      t.isFunctionExpression(b.declarations[0]?.init))
  ) {
    return b.declarations[0].init
  }
}

/**
 * @param {import('@babel/types').FunctionDeclaration | import('@babel/types').FunctionExpression | import('@babel/types').ArrowFunctionExpression} topNode
 * @param {any} currentNode
 * @param {string} code
 * @returns {string | undefined} if success, returns a string (can be empty if no code). if fail to extract, returns undefined.
 */
function getFunctionCode(topNode, currentNode, code) {
  if (t.isBlockStatement(topNode.body)) {
    // crawl to fn body, get body start to jsx
    const fnBody = topNode.body.body
    // get return statement that contains tihs iframe node
    const returnStatement = fnBody.findIndex(
      (c) =>
        c.type === 'ReturnStatement' && astContainsNode(c.argument, currentNode)
    )
    if (returnStatement !== -1) {
      // get the relevant fn code from the body to the return statement
      return returnStatement > 0
        ? code.slice(fnBody[0].start ?? 0, fnBody[returnStatement - 1].end ?? 0)
        : ''
    }
  } else if (t.isJSXElement(topNode.body)) {
    return 'code.slice(topNode.body.start ?? 0, topNode.body.start ?? 0)'
  }
}
