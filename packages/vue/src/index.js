import path from 'node:path'
import { createFilter } from 'vite'
import { parse, transform } from '@vue/compiler-dom'
import MagicString from 'magic-string'

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
      if (!filter(id) || id.includes('__whyframe-')) return
      if (!code.includes('<iframe')) return

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
      const baseHash = api.getHash(notTemplateCode)

      transform(ast, {
        nodeTransforms: [
          (node) => {
            if (
              node.tag === 'iframe' &&
              node.props.find((a) => a.name === 'data-why') &&
              node.children.length > 0
            ) {
              // extract iframe html
              const iframeContentStart = node.children[0].loc.start.offset
              const iframeContentEnd =
                node.children[node.children.length - 1].loc.end.offset
              const iframeContent = code.slice(
                iframeContentStart,
                iframeContentEnd
              )
              s.remove(iframeContentStart, iframeContentEnd)

              // derive final hash per iframe
              const finalHash = api.getHash(baseHash + iframeContent)

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
              const templateName = node.props.find(
                (a) => a.name === 'data-why-template'
              )?.value.content
              const iframeAttrs = api.getIframeAttrs(
                entryId,
                finalHash,
                templateName
              )
              s.appendLeft(
                node.loc.start.offset + `<iframe`.length,
                iframeAttrs
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
