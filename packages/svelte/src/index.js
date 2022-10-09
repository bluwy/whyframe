import { createFilter } from 'vite'
import { transform } from './shared.js'

/**
 * @type {import('..').whyframeSvelte}
 */
export function whyframeSvelte(options) {
  /** @type {import('@whyframe/core').Api} */
  let api

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

  return plugin
}
