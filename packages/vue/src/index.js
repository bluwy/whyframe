import { createHash } from 'node:crypto'
import { createFilter } from 'vite'
import { parse, transform } from '@vue/compiler-dom'
import MagicString from 'magic-string'

/**
 * @type {import('.').whyframeVue}
 */
export function whyframeVue(options) {
  const virtualIdToCode = new Map()
  // secondary map to track stale virtual ids on hot update
  const vueIdToVirtualIds = new Map()
  /** @type {import('@whyframe/core').Api} */
  let whyframeApi

  const filter = createFilter(options?.include || /\.vue$/, options?.exclude)

  return {
    name: 'whyframe:vue',
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
      if (!code.includes('<iframe')) return

      // parse instances of `<iframe why></iframe>` and extract them out as a virtual import
      const s = new MagicString(code)

      const ast = parse(code)

      // collect code needed for virtual imports, assume all these have side effects
      const notTemplateTags = ast.children.filter(
        (node) => node.tag !== 'template'
      )
      const notTemplateCode = notTemplateTags
        .map((node) => node.loc.source)
        .join('\n')

      // Generate initial hash
      const baseHash = whyframeApi.getHash(notTemplateCode)

      /** @type {string[]} */
      const scriptCode = []

      transform(ast, {
        nodeTransforms: [
          (node) => {
            if (
              node.tag === 'iframe' &&
              node.props.find((a) => a.name === 'why') &&
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
              const finalHash = whyframeApi.getHash(baseHash + iframeContent)

              // get iframe src
              // TODO: unify special treatment for why-template somewhere
              const customTemplateKey = node.props.find(
                (a) => a.name === 'why-template'
              )?.value.content

              const entryComponentId = whyframeApi.createEntryComponent(
                id,
                finalHash,
                '.vue',
                `\
<template>
${iframeContent}
</template>
${notTemplateCode}`
              )

              const entryId = whyframeApi.createEntry(
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

              const iframeSrc = whyframeApi.getIframeSrc(customTemplateKey)
              const iframeOnLoad = whyframeApi.getIframeLoadHandler(
                virtualEntry,
                this
              )

              const eventHandler = `__whyframe_${finalHash}`
              scriptCode.push(`const ${eventHandler} = ${iframeOnLoad}`)
              s.appendLeft(
                node.loc.start.offset + `<iframe`.length,
                ` src="${iframeSrc}" @load="${eventHandler}"`
              )
            }
          }
        ]
      })

      // inject event handlers to <script setup>
      // TODO: double check if this is right
      const scriptSetupNode = notTemplateTags.find(
        (node) =>
          node.tag === 'script' && node.props.some((p) => p.name === 'setup')
      )
      const injectCode = `\n${scriptCode.join('\n')}\n`
      if (scriptSetupNode) {
        s.prependLeft(
          scriptSetupNode.loc.end.offset - `</script>`.length,
          injectCode
        )
      } else {
        s.append(`<script setup>${injectCode}</script>`)
      }

      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: s.generateMap({ hires: true })
        }
      }
    }
  }
}
