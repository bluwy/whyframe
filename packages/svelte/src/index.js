import path from 'node:path'
import { createFilter } from 'vite'
import { parse, walk } from 'svelte/compiler'
import MagicString from 'magic-string'

/**
 * @type {import('.').whyframeSvelte}
 */
export function whyframeSvelte(options) {
  /** @type {import('@whyframe/core').Api} */
  let api
  /** @type {Parameters<import('@whyframe/core').Api['getIframeLoadHandler']>[0]} */
  let ctx

  const filter = createFilter(options?.include || /\.svelte$/, options?.exclude)

  /** @type {import('vite').Plugin} */
  const plugin = {
    name: 'whyframe:svelte',
    enforce: 'pre',
    configResolved(c) {
      api = c.plugins.find((p) => p.name === 'whyframe:api')?.api
      if (!api) {
        // TODO: maybe fail safe
        throw new Error('whyframe() plugin is not installed')
      }
    },
    buildStart() {
      ctx = this
    },
    transform(code, id) {
      if (!filter(id) || id.includes('__whyframe-')) return
      if (!code.includes('<iframe')) return

      // parse instances of `<iframe data-why></iframe>` and extract them out as a virtual import
      const s = new MagicString(code)

      const ast = parse(code)

      // collect code needed for virtual imports, assume all these have side effects
      // prettier-ignore
      const scriptCode = ast.instance ? code.slice(ast.instance.start, ast.instance.end) : ''
      // prettier-ignore
      const moduleScriptCode = ast.module ? code.slice(ast.module.start, ast.module.end) : ''
      const cssCode = ast.css ? code.slice(ast.css.start, ast.css.end) : ''

      // Generate initial hash
      const baseHash = api.getHash(scriptCode + moduleScriptCode + cssCode)

      walk(ast.html, {
        enter(node) {
          if (
            node.type === 'Element' &&
            node.name === 'iframe' &&
            node.attributes.find((a) => a.name === 'data-why') &&
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

            // derive final hash per iframe
            const finalHash = api.getHash(baseHash + iframeContent)

            const entryComponentId = api.createEntryComponent(
              id,
              finalHash,
              path.extname(id),
              `\
${moduleScriptCode}
${scriptCode}
${iframeContent}
${cssCode}`
            )

            const entryId = api.createEntry(
              id,
              finalHash,
              '.js',
              `\
import App from '${entryComponentId}'

export function createApp(el) {
  new App({ target: el })
}`
            )

            // inject template props
            const templateName = node.attributes
              .find((a) => a.name === 'data-why-template')
              ?.value.find((v) => v.type === 'Text')?.data
            const iframeAttrs = api.getIframeAttrs(
              entryId,
              finalHash,
              templateName
            )
            s.appendLeft(node.start + `<iframe`.length, iframeAttrs)
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

  // convert to vite-plugin-svelte's api so typescript etc are already preprocessed
  const _transform = plugin.transform
  delete plugin.transform
  plugin.api = {
    sveltePreprocess: {
      markup({ content, filename }) {
        return _transform.apply(ctx, [content, filename])
      }
    }
  }

  return plugin
}
