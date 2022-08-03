import { templateDefaultId } from './template.js'

/**
 * @param {import('..').Options} [options]
 * @returns {import('vite').Plugin}
 */
export function apiPlugin(options) {
  /** @type {boolean} */
  let isBuild

  return {
    name: 'whyframe:api',
    config(_, { command }) {
      isBuild = command === 'build'
    },
    /** @type {import('..').Api} */
    api: {
      getIframeSrc(templateKey) {
        return (
          options?.templateHtml?.[templateKey || 'default'] || templateDefaultId
        )
      },
      getIframeLoadHandler(virtualEntry) {
        // To let the iframe src know what to render, we pass a url through
        // window.__whyframe_app_url to inform of it. This needs special handling
        // in dev and build as Vite works differently.
        if (isBuild) {
          // Emit as chunk to emulate an entrypoint for HTML to load
          // https://rollupjs.org/guide/en/#thisemitfile
          const refId = this.emitFile({
            type: 'chunk',
            id: virtualEntry,
            // Vite sets false since it assumes we're operating an app,
            // but in fact this acts as a semi-library that needs the exports right
            preserveSignature: 'strict'
          })
          return `\
(e) => {
  e.target.contentWindow.__whyframe_app_url = import.meta.ROLLUP_FILE_URL_${refId}
  e.target.contentWindow.dispatchEvent(new Event('whyframe:ready'))
}`
        } else {
          // Cheekily exploits Vite's import analysis to get the transformed URL
          // to be loaded by the iframe. This works because files are served as is.
          return `\
(e) => {
  const t = () => import('${virtualEntry}')
  const importUrl = t.toString().match(/['"](.*?)['"]/)[1]
  e.target.contentWindow.__whyframe_app_url = importUrl
  e.target.contentWindow.dispatchEvent(new Event('whyframe:ready'))
}`
        }
      }
    }
  }
}
