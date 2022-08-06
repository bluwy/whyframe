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

  // template name to record of hash to id, used for final import map
  // generation of `whyframe:app-${templateName}`
  /** @type {Map<string, Record<string, string>>} */
  const buildEntryIds = new Map()

  return {
    name: 'whyframe:api',
    config(_, { command }) {
      isBuild = command === 'build'
    },
    /** @type {import('..').Api} */
    api: {
      _getEntryIds(templateName) {
        return buildEntryIds.get(templateName || 'default') || {}
      },
      getHash(text) {
        return createHash('sha256').update(text).digest('hex').substring(0, 8)
      },
      getIframeSrc(templateName) {
        return (
          options?.template?.[templateName || 'default'] || templateDefaultId
        )
      },
      getIframeLoadHandler(entryId, hash, templateName) {
        // to let the iframe src know what to render, we pass a url through
        // window.__whyframe_app_url__ to inform of it. this needs special handling
        // in dev and build as Vite works differently.
        if (isBuild) {
          templateName ||= 'default'
          if (!buildEntryIds.has(templateName)) {
            buildEntryIds.set(templateName, {})
          }
          buildEntryIds.get(templateName)[hash] = entryId
          return `\
(e) => {
  e.target.contentWindow.__whyframe_app_hash__ = '${hash}'
  e.target.contentWindow.dispatchEvent(new CustomEvent('whyframe:ready'))
}`
        } else {
          // cheekily exploit Vite's import analysis to get the transformed URL
          // to be loaded by the iframe. This works because files are served as is.
          return `\
(e) => {
  const t = () => import('${entryId}')
  const importUrl = t.toString().match(/['"](.*?)['"]/)[1]
  e.target.contentWindow.__whyframe_app_hash__ = importUrl
  e.target.contentWindow.dispatchEvent(new CustomEvent('whyframe:ready'))
}`
        }
      },
      createEntry(originalId, hash, ext, code) {
        // example: whyframe:entry-123456.jsx
        const entryId = `whyframe:entry-${hash}${ext}`
        virtualIdToCode.set(entryId, code)
        // original id tracking is only needed in dev for hot reloads
        if (!isBuild) {
          originalIdToVirtualIds.set(originalId, entryId)
        }
        return entryId
      },
      createEntryComponent(originalId, hash, ext, code) {
        // example: /User/bjorn/foo/bar/App.svelte__whyframe-123456.svelte
        const entryComponentId = `${originalId}__whyframe-${hash}${ext}`
        virtualIdToCode.set(entryComponentId, code)
        // original id tracking is only needed in dev for hot reloads
        if (!isBuild) {
          originalIdToVirtualIds.set(originalId, entryComponentId)
        }
        return entryComponentId
      }
    },
    resolveId(id) {
      // see createEntry for id signature
      if (id.startsWith('whyframe:entry')) {
        return '__' + id
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
      let virtualId
      // see createEntry for id signature
      if (id.startsWith('__whyframe:entry')) {
        virtualId = id.slice(2)
      }
      // see createEntryComponent for id signature
      if (id.includes('__whyframe-')) {
        virtualId = id
      }
      if (virtualId) {
        const code = virtualIdToCode.get(virtualId)
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
