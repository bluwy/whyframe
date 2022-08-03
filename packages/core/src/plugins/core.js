/**
 * @param {import('..').Options} [options]
 * @returns {import('vite').Plugin}
 */
export function whyframeCore(options) {
  return {
    name: 'whyframe:core',
    config(c, { command }) {
      if (command === 'build') {
        const haveExistingInput = c.build?.rollupOptions?.input
        const input = haveExistingInput ? {} : { index: 'index.html' }

        // add each template as input for Vite to process
        if (options?.templateHtml) {
          for (const [key, value] of Object.entries(options.templateHtml)) {
            input[`whyframe-template-${key}`] = value
          }
        }
        // also write builtin default template if user didn't specify their own
        if (!options?.templateHtml || !options.templateHtml.default) {
          input['whyframe-template-default'] = fallbackTemplateBuildPath
        }

        return {
          build: {
            rollupOptions: {
              input
            }
          }
        }
      }
    },
    resolveId(id) {
      if (id === 'whyframe:app') {
        return '\0whyframe:app'
      }
    },
    load(id) {
      if (id === '\0whyframe:app') {
        return `\
let isReadying = false

export async function createApp(el) {
  if (isReadying) return
  isReadying = true

  return new Promise((resolve, reject) => {
    if (window.__whyframe_app_url) {
      ready(el).then(resolve, reject)
    } else {
      window.addEventListener(
        'whyframe:ready',
        () => ready(el).then(resolve, reject),
        { once: true }
      )
    }
  })
}

async function ready(el) {
  const { createInternalApp } = await import(/* @vite-ignore */ window.__whyframe_app_url)
  const result = await createInternalApp(el)
  isReadying = false
  return result
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    isReadying = false // an error may happen in ready, so we reset to remount the app
  })
}`
      }
    }
  }
}
