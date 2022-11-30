import path from 'node:path'
import { parse, transform as vueTransform } from '@vue/compiler-dom'
import MagicString from 'magic-string'
import { dedent, escapeAttr, hash } from '@whyframe/core/pluginutils'

/**
 * @typedef {{
 *   parserOptions?: import('..').Options['parserOptions']
 * }} TransformOptions
 */

/**
 * @param {string} code
 * @param {string} id
 * @param {import('@whyframe/core').Api} api
 * @param {TransformOptions} [options]
 * @returns
 */
export function transform(code, id, api, options) {
  if (!api.moduleMayHaveIframe(id, code)) return

  const ext = path.extname(id)

  // parse instances of `<iframe data-why></iframe>` and extract them out as a virtual import
  const s = new MagicString(code)

  const ast = parse(code, options?.parserOptions)

  // collect code needed for virtual imports, assume all these have side effects
  const notTemplateTags = ast.children.filter(
    (node) => node['tag'] !== 'template'
  )
  const notTemplateCode = notTemplateTags
    .map((node) => node.loc.source)
    .join('\n')

  // Generate initial hash
  const baseHash = hash(notTemplateCode)

  vueTransform(ast, {
    nodeTransforms: [
      (/** @type {import('@vue/compiler-dom').ElementNode} */ node) => {
        const isIframeElement =
          node.tag === 'iframe' && node.props.some((a) => a.name === 'data-why')

        if (isIframeElement) {
          // if contains slot, it implies that it's accepting the component's
          // slot as iframe content, we need to proxy them
          if (
            node.children?.some((c) =>
              c['content']?.trimLeft().startsWith('<slot')
            )
          ) {
            const attrs = api.getProxyIframeAttrs()
            addAttrs(s, node, attrs)
            s.remove(
              node.children[0].loc.start.offset,
              node.children[node.children.length - 1].loc.end.offset
            )
            return
          }
        }

        const iframeComponent = api.getComponent(node.tag)

        if (isIframeElement || iframeComponent) {
          // extract iframe html
          let iframeContent = ''
          if (node.children.length > 0) {
            const start = node.children[0].loc.start.offset
            const end = node.children[node.children.length - 1].loc.end.offset
            iframeContent = code.slice(start, end)
            s.remove(start, end)
          }

          // derive final hash per iframe
          const finalHash = hash(baseHash + iframeContent)

          const entryComponentId = api.createEntryComponent(
            id,
            finalHash,
            ext.startsWith('.md') ? '.vue' : ext,
            `\
<template>
  ${iframeContent}
</template>
${notTemplateCode}`
          )

          const entryId = api.createEntry(
            id,
            finalHash,
            '.js',
            `\
import { createApp as _createApp } from 'vue'
import App from '${entryComponentId}'

export function createApp(el, opts) {
  const app = _createApp(App)
  if (opts?.enhanceApp) {
    opts.enhanceApp(app)
  }
  app.mount(el)
  return {
    destroy: () => app.unmount()
  }
}`
          )

          let showSource = api.getDefaultShowSource()
          if (isIframeElement) {
            const prop = node.props.find(
              (p) => p.name === 'data-why-show-source'
            )
            if (prop) {
              if (prop['value'] === undefined) {
                showSource = true
              } else if (prop['value']?.content) {
                showSource = prop['value'].content === 'true'
              } else if (prop['value'][0]?.expression) {
                showSource = prop['value'][0].expression.value === true
              }
            }
          } else if (iframeComponent) {
            if (typeof iframeComponent.showSource === 'boolean') {
              showSource = iframeComponent.showSource
            } else if (typeof iframeComponent.showSource === 'function') {
              const openTag = code.slice(
                node.loc.start.offset,
                node.children[0]?.loc.start.offset ?? node.loc.end.offset
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
    ]
  })

  if (s.hasChanged()) {
    return {
      code: s.toString(),
      map: s.generateMap({ hires: true })
    }
  }
}

/**
 * @param {MagicString} s
 * @param {import('@vue/compiler-dom').ElementNode} node
 * @param {import('@whyframe/core').Attr[]} attrs
 */
export function addAttrs(s, node, attrs) {
  const attrNames = node.props.map((p) =>
    p.name !== 'bind' ? p.name : p['arg'].content
  )

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
    node.loc.start.offset + node.tag.length + 1,
    safeAttrs.map((a) => ` :${a.name}="${parseAttrToString(a)}"`).join('')
  )

  for (const attr of mixedAttrs) {
    const attrNode = node.props.find((p) => p['arg']?.content === attr.name)
    if (!attrNode) continue
    const expNode = attrNode['exp']
    if (!expNode) continue

    // :foo={foo && bar} -> :foo="(foo && bar) || &quot;fallback&quot;"
    s.overwrite(
      expNode.loc.start.offset,
      expNode.loc.end.offset,
      `(${expNode.content}) || ${parseAttrToString(attr)}`
    )
  }
}

/**
 * @param {import('@whyframe/core').Attr} attr
 */
export function parseAttrToString(attr) {
  if (attr.type === 'dynamic' && typeof attr.value === 'string') {
    // TODO: i hate this
    const [value, ...extra] = attr.value.split(' ')
    return `$attrs.${value} || $props.${value} ${escapeAttr(extra.join(''))}`
  } else {
    return `${escapeAttr(JSON.stringify(attr.value))}`
  }
}

/**
 * @param {{ name: string }[]} plugins
 * @param {string} pluginAName
 * @param {'before' | 'after'} order
 * @param {string} pluginBName
 */
// TODO: move this to pluginutils
export function movePlugin(plugins, pluginAName, order, pluginBName) {
  const pluginBIndex = plugins.findIndex((p) => p.name === pluginBName)
  if (pluginBIndex === -1) return

  const pluginAIndex = plugins.findIndex((p) => p.name === pluginAName)
  if (pluginAIndex === -1) return

  if (order === 'before' && pluginAIndex > pluginBIndex) {
    const pluginA = plugins.splice(pluginAIndex, 1)[0]
    plugins.splice(pluginBIndex, 0, pluginA)
  }

  if (order === 'after' && pluginAIndex < pluginBIndex) {
    const pluginA = plugins.splice(pluginAIndex, 1)[0]
    plugins.splice(pluginBIndex, 0, pluginA)
  }
}
