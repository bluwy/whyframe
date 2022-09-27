import { createFilter } from 'vite'
import { guessFrameworkFromTsconfig, transform } from './shared.js'

/**
 * @type {import('..').whyframeJsx}
 */
export function whyframeJsx(options) {
  /** @type {import('@whyframe/core').Api} */
  let api

  const filter = createFilter(options?.include || /\.[jt]sx$/, options?.exclude)
  const fallbackFramework =
    options?.defaultFramework || guessFrameworkFromTsconfig()

  /** @type {import('vite').Plugin} */
  const plugin = {
    name: 'whyframe:jsx',
    enforce: 'pre',
    configResolved(c) {
      api = c.plugins.find((p) => p.name === 'whyframe:api')?.api
      if (!api) {
        // TODO: maybe fail safe
        throw new Error('whyframe() plugin is not installed')
      }

      // run our plugin before astro's
      const astro = c.plugins.findIndex((p) => p.name === 'astro:jsx')
      if (astro !== -1) {
        const myIndex = c.plugins.findIndex((p) => p.name === 'whyframe:jsx')
        if (myIndex !== -1) {
          // @ts-ignore-error hack
          c.plugins.splice(myIndex, 1)
          // @ts-ignore-error hack
          c.plugins.splice(astro, 0, plugin)
          delete plugin.enforce
        }
      }
    },
    transform(code, id) {
      if (filter(id)) {
        return transform(code, id, api, {
          fallbackFramework,
          parserOptions: options?.parserOptions
        })
      }
    }
  }

  return plugin
}
