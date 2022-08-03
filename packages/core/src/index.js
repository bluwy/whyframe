import { apiPlugin } from './plugins/api.js'
import { corePlugin } from './plugins/core.js'
import { templatePlugin } from './plugins/template.js'

/**
 * @param {import('.').Options} options
 * @returns {import('vite').Plugin}
 */
export function whyframe(options) {
  return [apiPlugin(options), corePlugin(options), templatePlugin()]
}
