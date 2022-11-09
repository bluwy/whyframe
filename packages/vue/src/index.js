import { createFilter } from 'vite'
import { movePlugin, transform } from './shared.js'

/**
 * @type {import('..').whyframeVue}
 */
export function whyframeVue(options) {
  /** @type {import('@whyframe/core').Api} */
  let api
  let isNuxt = false

  const filter = createFilter(options?.include || /\.vue$/, options?.exclude)

  /** @type {import('vite').Plugin} */
  return {
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
      // @ts-expect-error ignore readonly type
      movePlugin(c.plugins, 'whyframe:vue', 'after', 'vitepress')

      // the vue plugin auto returns id if match ?vue, which interferes with whyframe:api
      // virtual id resolver. make sure we run ours before vue
      // @ts-expect-error ignore readonly type
      movePlugin(c.plugins, 'whyframe:api', 'before', 'vite:vue')

      if (options?.nuxtCompat) {
        isNuxt = c.plugins.some((p) => p.name.startsWith('nuxt:'))
      }
    },
    transform(code, id) {
      if (filter(id)) {
        return transform(code, id, api, options)
      }
      // this is terrible but nuxt is the only vite metaframework that serves vite urls
      // through `/_nuxt/` instead of the root directly for some reason since 3.0.0-rc.12
      if (isNuxt && id === '\0whyframe:app') {
        return code.replace(
          '/* @vite-ignore */ url',
          '/* @vite-ignore */ "/_nuxt" + url'
        )
      }
    }
  }
}
