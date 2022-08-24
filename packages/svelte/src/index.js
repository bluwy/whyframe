import path from 'node:path'
import { createFilter } from 'vite'
import { parse, walk } from 'svelte/compiler'
import MagicString from 'magic-string'
import { dedent, hash } from '@whyframe/core/pluginutils'

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
      if (!filter(id)) return
      if (!api.moduleMayHaveIframe(id, code)) return

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
      const baseHash = hash(scriptCode + moduleScriptCode + cssCode)

      walk(ast.html, {
        enter(node) {
          const isIframeElement =
            node.type === 'Element' &&
            node.name === 'iframe' &&
            node.attributes.some((a) => a.name === 'data-why')

          if (isIframeElement) {
            // if contains slot, it implies that it's accepting the component's
            // slot as iframe content, we need to proxy them
            if (node.children?.some((c) => c.type === 'Slot')) {
              const attrs = api.getProxyIframeAttrs()
              s.appendLeft(node.start + `<iframe`.length, stringifyAttrs(attrs))
              this.skip()
              return
            }
          }

          const isIframeComponent =
            node.type === 'InlineComponent' && api.isIframeComponent(node.name)

          if (isIframeElement || isIframeComponent) {
            // extract iframe html
            let iframeContent = ''
            if (node.children.length > 0) {
              const start = node.children[0].start
              const end = node.children[node.children.length - 1].end
              iframeContent = code.slice(start, end)
              s.remove(start, end)
            }

            // derive final hash per iframe
            const finalHash = hash(baseHash + iframeContent)

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
  const app = new App({ target: el })
  return {
    destroy: () => app.$destroy()
  }
}`
            )

            // inject template props
            const templatePropName = isIframeComponent
              ? 'whyTemplate'
              : 'data-why-template'
            const templateName = node.attributes
              .find((a) => a.name === templatePropName)
              ?.value.find((v) => v.type === 'Text')?.data
            const shouldAddSource = node.attributes.some(
              (a) => a.name === 'data-why-source'
            )
            const attrs = api.getMainIframeAttrs(
              entryId,
              finalHash,
              templateName,
              shouldAddSource ? dedent(iframeContent) : undefined,
              isIframeComponent
            )
            s.appendLeft(
              node.start + node.name.length + 1,
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

/**
 * @param {import('@whyframe/core').Attr[]} attrs
 */
function stringifyAttrs(attrs) {
  let str = ''
  for (const attr of attrs) {
    if (attr.type === 'static') {
      str += ` ${attr.name}=${JSON.stringify(attr.value)}`
    } else {
      str += ` ${attr.name}={$$props.${attr.value}}`
    }
  }
  return str
}
