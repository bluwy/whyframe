import { fallbackTemplateId } from './template.js'

/**
 * @param {import('..').Options} [options]
 * @returns {import('vite').Plugin}
 */
export function apiPlugin(options) {
  return {
    name: 'whyframe:api',
    /** @type {import('..').Api} */
    api: {
      getIframeSrc(templateKey) {
        return (
          options?.templateHtml?.[templateKey || 'default'] ||
          fallbackTemplateId
        )
      }
    }
  }
}
