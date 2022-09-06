import { apiPlugin } from './plugins/api.js'
import { corePlugin } from './plugins/core.js'
import { templatePlugin } from './plugins/template.js'

/**
 * @type {import('..').whyframe}
 */
export function whyframe(options) {
  return [apiPlugin(options), corePlugin(), ...templatePlugin(options)]
}
