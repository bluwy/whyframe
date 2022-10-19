import { createFilter } from 'vite'
import { transform } from './shared.js'

/**
 * @type {import('..').whyframeSvelte}
 */
export function whyframeSvelte(options) {
  /** @type {import('@whyframe/core').Api} */
  let api
  /** @type {any} */
  let ctx

  const filter = createFilter(options?.include || /\.svelte$/, options?.exclude)

  /** @type {import('vite').Plugin} */
  const plugin = {
    name: 'whyframe:svelte',
    enforce: 'pre',
    buildStart() {
      ctx = this
    },
    configResolved(c) {
      api = c.plugins.find((p) => p.name === 'whyframe:api')?.api
      if (!api) {
        // TODO: maybe fail safe
        throw new Error('whyframe() plugin is not installed')
      }

      // run our plugin before svelte's (can happen in sveltekit)
      const svelte = c.plugins.findIndex((p) => p.name === 'vite-plugin-svelte')
      if (svelte !== -1) {
        const myIndex = c.plugins.findIndex((p) => p.name === 'whyframe:svelte')
        if (myIndex !== -1 && myIndex > svelte) {
          // @ts-ignore-error hack
          c.plugins.splice(myIndex, 1)
          // @ts-ignore-error hack
          c.plugins.splice(svelte, 0, plugin)
        }
      }
    },
    transform(code, id) {
      if (filter(id)) {
        return transform(code, id, api)
      }
    }
  }

  if (options?.preprocess) {
    // convert to vite-plugin-svelte's api so typescript etc are already preprocessed
    const _transform = plugin.transform
    delete plugin.transform
    plugin.api = {
      sveltePreprocess: {
        markup({ content, filename }) {
          // @ts-expect-error
          return _transform.apply(ctx, [content, filename])
        }
      }
    }
  }

  return plugin
}
