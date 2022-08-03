import { apiPlugin } from './plugins/api.js'
import { whyframeCore } from './plugins/core.js'
import { fallbackTemplatePlugin } from './plugins/template.js'

/**
 * @param {import('.').Options} options
 * @returns {import('vite').Plugin}
 */
export function whyframe(options) {
  return [apiPlugin(), whyframeCore(options), fallbackTemplatePlugin()]
}
