import { createHash } from 'node:crypto'
import path from 'node:path'
import { parse, walk } from 'svelte/compiler'
import MagicString from 'magic-string'
import {
  fallbackTemplateBuildPath,
  fallbackTemplateId,
  fallbackTemplatePlugin
} from './fallbackTemplate.js'

/**
 * @param {{
 *  templateHtml?: Record<string, string>
 * }} options
 * @returns {import('vite').Plugin}
 */
export function whyframe(options) {
  return [
    whyframeCore(options),
    whyframeSvelte(options),
    fallbackTemplatePlugin()
  ]
}

/**
 * @param {{
 *  templateHtml?: Record<string, string>
 * }} options
 * @returns {import('vite').Plugin}
 */
export function whyframeCore(options) {
  return {
    name: 'whyframe:core',
    config(c, { command }) {
      if (command === 'build') {
        const haveExistingInput = c.build?.rollupOptions?.input
        const input = haveExistingInput ? {} : { index: 'index.html' }

        if (options.templateHtml) {
          for (const [key, value] of Object.entries(options.templateHtml)) {
            input[`whyframe-template-${key}`] = value
          }
        } else {
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

/**
 * @param {{
 *  templateHtml: Record<string, string>
 * }} options
 * @returns {import('vite').Plugin}
 */
export function whyframeSvelte(options) {
  // TODO: invalidate stale
  const virtualIdToCode = new Map()
  let isBuild = false

  return {
    name: 'whyframe:svelte',
    enforce: 'pre',
    config(_, { command }) {
      isBuild = command === 'build'
    },
    transform(code, id) {
      // TODO: filter
      if (!id.endsWith('.svelte')) return

      // parse instances of `<iframe why></iframe>` and extract them out as a virtual import
      const s = new MagicString(code)

      const ast = parse(code)

      // prettier-ignore
      const scriptCode = ast.instance ? code.slice(ast.instance.start, ast.instance.end) : ''
      // prettier-ignore
      const moduleScriptCode = ast.module ? code.slice(ast.module.start, ast.module.end) : ''
      const cssCode = ast.css ? code.slice(ast.css.start, ast.css.end) : ''

      const baseHash = getHash(scriptCode + moduleScriptCode + cssCode)

      walk(ast.html, {
        enter: (node) => {
          if (
            node.type === 'Element' &&
            node.name === 'iframe' &&
            node.attributes.find((a) => a.name === 'why') &&
            node.children.length > 0
          ) {
            const iframeContentStart = node.children[0].start
            const iframeContentEnd = node.children[node.children.length - 1].end
            const iframeContent = code.slice(
              iframeContentStart,
              iframeContentEnd
            )
            s.remove(iframeContentStart, iframeContentEnd)

            const finalHash = getHash(baseHash + iframeContent)

            const iframeSrc =
              node.attributes
                .find((a) => a.name === 'why-template') // TODO: use src
                ?.value.find((v) => v.type === 'Text')?.data ||
              options.templateHtml?.default ||
              fallbackTemplateId

            const virtualEntryJs = `whyframe:entry-${finalHash}.js`
            const virtualComponent = `${id}-whyframe-${finalHash}.svelte`

            let onLoad
            if (isBuild) {
              // Emit as chunk to emulate an entrypoint for HTML to load
              // https://rollupjs.org/guide/en/#thisemitfile
              const refId = this.emitFile({
                type: 'chunk',
                id: virtualEntryJs,
                // Vite sets false since it assumes we're operating an app,
                // but in fact this acts as a semi-library that needs the exports right
                preserveSignature: 'strict'
              })
              onLoad = `\
function() {
  this.contentWindow.__whyframe_app_url = import.meta.ROLLUP_FILE_URL_${refId};
  this.contentWindow.dispatchEvent(new Event('whyframe:ready'));
}`
            } else {
              // Cheekily exploits Vite's import analysis to get the transformed URL
              // to be loaded by the iframe. This works because files are served as is.
              onLoad = `\
function() {
  const t = () => import('${virtualEntryJs}')
  const importUrl = t.toString().match(/['"](.*?)['"]/)[1]
  this.contentWindow.__whyframe_app_url = importUrl;
  this.contentWindow.dispatchEvent(new Event('whyframe:ready'));
}`
            }

            s.appendLeft(
              node.start + `<iframe`.length,
              ` src="${iframeSrc}" on:load={${onLoad}}`
            )

            virtualIdToCode.set(
              virtualEntryJs,
              `\
import App from '${virtualComponent}'

export function createInternalApp(el) {
  new App({ target: el })
}`
            )
            virtualIdToCode.set(
              virtualComponent,
              `\
${moduleScriptCode}
${scriptCode}
${iframeContent}
${cssCode}`
            )
          }
        }
      })

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      }
    },
    resolveId(id) {
      if (id.startsWith('whyframe:')) {
        return '\0' + id
      }
      if (id.includes('-whyframe-')) {
        // NOTE: this gets double resolved for some reason
        if (id.startsWith(process.cwd())) {
          return id
        } else {
          // TODO: resolve with root?
          return path.join(process.cwd(), id)
        }
      }
    },
    load(id) {
      if (id.startsWith('\0whyframe:') || id.includes('-whyframe-')) {
        if (id.startsWith('\0')) id = id.slice(1)
        return virtualIdToCode.get(id)
      }
    }
  }
}

function getHash(text) {
  return createHash('sha256').update(text).digest('hex').substring(0, 8)
}
