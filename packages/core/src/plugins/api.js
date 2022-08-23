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

  // used for final import map  generation
  /** @type {Map<string, string>} */
  const hashToEntryIds = new Map()

  return {
    name: 'whyframe:api',
    config(_, { command }) {
      isBuild = command === 'build'
    },
    /** @type {import('..').Api} */
    api: {
      _getHashToEntryIds() {
        return hashToEntryIds
      },
      isIframeComponent(componentName) {
        return !!options.components?.includes(componentName)
      },
      moduleMayHaveIframe(id, code) {
        return (
          !id.includes('__whyframe:') &&
          !id.includes('__whyframe-') &&
          (code.includes('<iframe') ||
            !!options.components?.some((n) => code.includes(`<${n}`)))
        )
      },
      getMainIframeAttrs(entryId, hash, templateName, rawSource, isComponent) {
        /** @type {import('..').Attr[]} */
        const attrs = []
        attrs.push({
          type: 'static',
          name: isComponent ? 'whyframeSrc' : 'src',
          value:
            options?.template?.[templateName || 'default'] || templateDefaultId
        })
        if (isBuild) {
          hashToEntryIds.set(hash, entryId)
          attrs.push({
            type: 'static',
            name: isComponent ? 'whyframeAppId' : 'data-why-app-id',
            value: hash
          })
        } else {
          attrs.push({
            type: 'static',
            name: isComponent ? 'whyframeAppId' : 'data-why-app-id',
            value: `/@id/__${entryId}`
          })
        }
        // TODO: allow disable this to save bundle size?
        attrs.push({
          type: 'static',
          name: isComponent ? 'whyframeRawSource' : 'data-why-raw-source',
          value: rawSource
        })
        return attrs
      },
      getProxyIframeAttrs() {
        /** @type {import('..').Attr[]} */
        return [
          { type: 'dynamic', name: 'src', value: 'whyframeSrc' },
          {
            type: 'dynamic',
            name: 'data-why-app-id',
            value: 'whyframeAppId'
          },
          {
            type: 'dynamic',
            name: 'data-why-raw-source',
            value: 'whyframeRawSource'
          }
        ]
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
