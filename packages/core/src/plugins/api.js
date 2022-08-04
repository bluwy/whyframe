import { createHash } from 'node:crypto'
import path from 'node:path'
import { templateDefaultId } from './template.js'

/**
 * @param {import('..').Options} [options]
 * @returns {import('vite').Plugin}
 */
export function apiPlugin(options) {
  /** @type {Map<string, string>} */
  const virtualIdToCode = new Map()

  // secondary map to track stale virtual ids on hot update
  /** @type {Map<string, string>} */
  const originalIdToVirtualIds = new Map()

  /** @type {boolean} */
  let isBuild

  return {
    name: 'whyframe:api',
    config(_, { command }) {
      isBuild = command === 'build'
    },
    /** @type {import('..').Api} */
    api: {
      getHash(text) {
        return createHash('sha256').update(text).digest('hex').substring(0, 8)
      },
      getIframeSrc(templateName) {
        return (
          options?.template?.[templateName || 'default'] || templateDefaultId
        )
      },
      getIframeLoadHandler(ctx, entryId) {
        // To let the iframe src know what to render, we pass a url through
        // window.__whyframe_app_url to inform of it. This needs special handling
        // in dev and build as Vite works differently.
        if (isBuild) {
          // Emit as chunk to emulate an entrypoint for HTML to load
          // https://rollupjs.org/guide/en/#thisemitfile
          const refId = ctx.emitFile({
            type: 'chunk',
            id: entryId,
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
  const t = () => import('${entryId}')
  const importUrl = t.toString().match(/['"](.*?)['"]/)[1]
  e.target.contentWindow.__whyframe_app_url = importUrl
  e.target.contentWindow.dispatchEvent(new Event('whyframe:ready'))
}`
        }
      },
      createEntry(originalId, hash, ext, code) {
        // example: whyframe:entry-123456.jsx
        const entryId = `whyframe:entry-${hash}${ext}`
        virtualIdToCode.set(entryId, code)
        originalIdToVirtualIds.set(originalId, entryId)
        return entryId
      },
      createEntryComponent(originalId, hash, ext, code) {
        // example: /User/bjorn/foo/bar/App.svelte__whyframe-123456.svelte
        const entryComponentId = `${originalId}__whyframe-${hash}${ext}`
        virtualIdToCode.set(entryComponentId, code)
        originalIdToVirtualIds.set(originalId, entryComponentId)
        return entryComponentId
      }
    },
    resolveId(id) {
      // see createEntry for id signature
      if (id.startsWith('whyframe:entry')) {
        return '\0' + id
      }
      // see createEntryComponent for id signature
      if (id.includes('__whyframe-')) {
        // NOTE: this gets double resolved for some reason
        if (id.startsWith(process.cwd())) {
          return id
        } else {
          return path.join(process.cwd(), id)
        }
      }
    },
    load(id) {
      // see createEntry for id signature
      if (id.startsWith('\0whyframe:entry')) {
        return virtualIdToCode.get(id.slice(1))
      }
      // see createEntryComponent for id signature
      if (id.includes('__whyframe-')) {
        const code = virtualIdToCode.get(id)
        if (typeof code === 'string') {
          return { code, map: { mappings: '' } }
        } else {
          return code
        }
      }
    },
    handleHotUpdate({ file }) {
      // remove stale virtual ids
      // NOTE: hot update always come first before transform
      if (originalIdToVirtualIds.has(file)) {
        const staleVirtualIds = originalIdToVirtualIds.get(file)
        for (const id of staleVirtualIds) {
          virtualIdToCode.delete(id)
        }
      }
    }
  }
}

function getEntryId(hash, ext) {
  return `whyframe:entry-${hash}${ext}`
}

function getEntryComponentId(originalId, hash, ext) {
  return `${originalId}__whyframe-${hash}${ext}`
}
