import { createHash } from 'node:crypto'
import path from 'node:path'
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
      const baseHash = getHash(notTemplateCode)

      /** @type {string[]} */
      const virtualIds = []

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
              const finalHash = getHash(baseHash + iframeContent)

              // get iframe src
              // TODO: unify special treatment for why-template somewhere
              const customTemplateKey = node.props.find(
                (a) => a.name === 'why-template'
              )?.value.content
              const virtualEntry = `whyframe:entry-${finalHash}`
              const virtualComponent = `${id}-whyframe-${finalHash}.vue`
              const iframeSrc = whyframeApi.getIframeSrc(customTemplateKey)
              const iframeOnLoad = whyframeApi.getIframeLoadHandler(
                virtualEntry,
                this
              )

              virtualIds.push(virtualEntry, virtualComponent)

              const eventHandler = `__whyframe_${finalHash}`
              scriptCode.push(`const ${eventHandler} = ${iframeOnLoad}`)
              s.appendLeft(
                node.loc.start.offset + `<iframe`.length,
                ` src="${iframeSrc}" @load="${eventHandler}"`
              )

              virtualIdToCode.set(
                virtualEntry,
                `\
import { createApp } from 'vue'
import App from '${virtualComponent}'

export function createInternalApp(el) {
  createApp(App).mount(el)
}`
              )
              // TODO: better sourcemaps
              virtualIdToCode.set(
                virtualComponent,
                `\
<template>
${iframeContent}
</template>
${notTemplateCode}`
              )
            }
          }
        ]
      })

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

      // save virtual imports for invalidation when file updates
      vueIdToVirtualIds.set(id, virtualIds)

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
      if (vueIdToVirtualIds.has(file)) {
        const staleVirtualIds = vueIdToVirtualIds.get(file)
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
