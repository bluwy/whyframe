import { createFilter } from 'vite'
import { transform } from './shared.js'

/**
 * @type {import('..').whyframeVue}
 */
export function whyframeVue(options) {
  /** @type {import('@whyframe/core').Api} */
  let api

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
        const myIndex = c.plugins.findIndex((p) => p.name === 'whyframe:vue')
        if (myIndex !== -1) {
          const iAmBeforeVitepress = myIndex < vitepress
          // @ts-expect-error hack
          c.plugins.splice(myIndex, 1)
          // @ts-expect-error hack
          c.plugins.splice(vitepress + (iAmBeforeVitepress ? 0 : 1), 0, plugin)
        }
      }
    },
    transform(code, id) {
      if (filter(id)) {
        return transform(code, id, api, options)
      }
    }
  }

  return plugin
}
