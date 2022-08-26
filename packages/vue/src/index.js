import path from 'node:path'
import { createFilter } from 'vite'
import { parse, transform } from '@vue/compiler-dom'
import MagicString from 'magic-string'
import { dedent, escapeAttr, hash } from '@whyframe/core/pluginutils'

/**
 * @type {import('.').whyframeVue}
 */
export function whyframeVue(options) {
  /** @type {import('@whyframe/core').Api} */
  let api

  /** @type {boolean} */
  let isVitepress = false

  const filter = createFilter(options?.include || /\.vue$/, options?.exclude)

  /** @type {import('vite').Plugin} */
  const plugin = {
    name: 'whyframe:vue',
    enforce: 'pre',
    configResolved(c) {
      api = c.plugins.find((p) => p.name === 'whyframe:api')?.api
      if (!api) {
        // TODO: maybe fail safe
        throw new Error('whyframe() plugin is not installed')
      }

      // special case: the vitepress plugin and vue plugin are added side-by-side,
      // which causes problems for us as we use vue's compiler to extract iframes.
      // by default, our plugin runs before vitepress, which we only see plain md.
      // we need to see the transformed md -> vue instead, which is between the vitepress
      // plugin and the vue plugin. for us to do so, we move ourself to after vitepress.
      const vitepress = c.plugins.findIndex((p) => p.name === 'vitepress')
      if (vitepress !== -1) {
        isVitepress = true
        const myIndex = c.plugins.findIndex((p) => p.name === 'whyframe:vue')
        if (myIndex !== -1) {
          c.plugins.splice(myIndex, 1)
          c.plugins.splice(vitepress, 0, plugin)
          delete plugin.enforce
        }
      }
    },
    transform(code, id) {
      if (!filter(id)) return
      if (!api.moduleMayHaveIframe(id, code)) return

      // parse instances of `<iframe data-why></iframe>` and extract them out as a virtual import
      const s = new MagicString(code)

      const ast = parse(code, options?.parserOptions)

      // collect code needed for virtual imports, assume all these have side effects
      const notTemplateTags = ast.children.filter(
        (node) => node.tag !== 'template'
      )
      const notTemplateCode = notTemplateTags
        .map((node) => node.loc.source)
        .join('\n')

      // Generate initial hash
      const baseHash = hash(notTemplateCode)

      transform(ast, {
        nodeTransforms: [
          (node) => {
            const isIframeElement =
              node.tag === 'iframe' &&
              node.props.some((a) => a.name === 'data-why')

            if (isIframeElement) {
              // if contains slot, it implies that it's accepting the component's
              // slot as iframe content, we need to proxy them
              if (
                node.children?.some((c) =>
                  c.content?.trimLeft().startsWith('<slot')
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
                const end =
                  node.children[node.children.length - 1].loc.end.offset
                iframeContent = code.slice(start, end)
                s.remove(start, end)
              }

              // derive final hash per iframe
              const finalHash = hash(baseHash + iframeContent)

              const entryComponentId = api.createEntryComponent(
                id,
                finalHash,
                isVitepress ? '.vue' : path.extname(id),
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

export function createApp(el) {
  const app = _createApp(App)
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
                  if (prop.value === undefined) {
                    showSource = true
                  } else if (prop.value?.content) {
                    showSource = prop.value.content === 'true'
                  } else if (prop.value[0]?.expression) {
                    showSource = prop.value[0].expression.value === true
                  }
                }
              } else if (iframeComponent) {
                if (typeof iframeComponent.source === 'boolean') {
                  showSource = iframeComponent.source
                } else if (typeof iframeComponent.source === 'function') {
                  const openTag = code.slice(
                    node.loc.start.offset,
                    node.children[0]?.start ?? node.end
                  )
                  showSource = iframeComponent.source(openTag)
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
  }

  return plugin
}

/**
 * @param {MagicString} s
 * @param {import('@vue/compiler-dom').TemplateChildNode} node
 * @param {import('@whyframe/core').Attr[]} attrs
 */
function addAttrs(s, node, attrs) {
  const attrNames = node.props.map((p) =>
    p.name !== 'bind' ? p.name : p.arg.content
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
    const attrNode = node.props.find((p) => p.arg?.content === attr.name)
    if (!attrNode) continue
    const expNode = attrNode.exp
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
function parseAttrToString(attr) {
  if (attr.type === 'dynamic' && typeof attr.value === 'string') {
    // TODO: i hate this
    const [value, ...extra] = attr.value.split(' ')
    return `$attrs.${value} || $props.${value} ${escapeAttr(extra.join(''))}`
  } else {
    return `${escapeAttr(JSON.stringify(attr.value))}`
  }
}
