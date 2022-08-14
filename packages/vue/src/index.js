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
  const componentNames = options?.components?.map((c) => c.name) ?? []
  const componentPaths =
    options?.components?.flatMap((c) => [c.path, path.resolve(c.path)]) ?? []

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
      if (!filter(id) || id.includes('__whyframe-')) return
      if (
        !code.includes('<iframe') &&
        componentNames.every((n) => !code.includes(`<${n}`))
      )
        return

      const isProxyMode = componentPaths.includes(id)

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
              node.props.find((a) => a.name === 'data-why')

            if (isProxyMode) {
              // proxy mode only process iframe elements
              if (isIframeElement) {
                const attrs = api.getProxyIframeAttrs()
                s.appendLeft(
                  node.loc.start.offset + `<iframe`.length,
                  stringifyAttrs(attrs)
                )
              }
              return
            }

            const isIframeComponent = componentNames.includes(node.tag)

            if (isIframeElement || isIframeComponent) {
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
  _createApp(App).mount(el)
}`
              )

              // inject template props
              const templatePropName = isIframeComponent
                ? 'whyTemplate'
                : 'data-why-template'
              const templateName = node.props.find(
                (a) => a.name === templatePropName
              )?.value.content
              const attrs = api.getMainIframeAttrs(
                entryId,
                finalHash,
                templateName,
                dedent(iframeContent),
                isIframeComponent
              )
              const injectOffset = isIframeComponent
                ? 1 + node.tag.length
                : `<iframe`.length
              s.appendLeft(
                node.loc.start.offset + injectOffset,
                stringifyAttrs(attrs)
              )
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
 * @param {import('@whyframe/core').Attr[]} attrs
 */
function stringifyAttrs(attrs) {
  let str = ''
  for (const attr of attrs) {
    if (attr.type === 'static') {
      str += ` ${attr.name}=${JSON.stringify(escapeAttr(attr.value))}`
    } else {
      str += ` :${attr.name}="$attrs.${attr.value} || $props.${attr.value}"`
    }
  }
  return str
}
