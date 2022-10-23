import path from 'node:path'
import { templateDefaultId } from './template.js'

/**
 * @param {import('../..').Options} [options]
 * @returns {import('vite').Plugin}
 */
export function apiPlugin(options = {}) {
  /** @type {Map<string, import('../..').LoadResult>} */
  const virtualIdToCode = new Map()

  // secondary map to track stale virtual ids on hot update
  /** @type {Map<string, string[]>} */
  const originalIdToVirtualIds = new Map()

  /** @type {boolean} */
  let isBuild
  /** @type {string} */
  let projectRoot

  // used for final import map generation
  /** @type {Map<string, string>} */
  const hashToEntryIds = new Map()

  /**
   * @param {string} originalId
   * @param {string} virtualId
   */
  function trackVirtualId(originalId, virtualId) {
    // original id tracking is only needed in dev for hot reloads
    if (!isBuild) {
      const virtualIds = originalIdToVirtualIds.get(originalId) ?? []
      virtualIds.push(virtualId)
      originalIdToVirtualIds.set(originalId, virtualIds)
    }
  }

  return {
    name: 'whyframe:api',
    config(_, { command }) {
      isBuild = command === 'build'
    },
    configResolved(c) {
      projectRoot = c.root
    },
    /** @type {import('../..').Api} */
    api: {
      _getHashToEntryIds() {
        return hashToEntryIds
      },
      _getVirtualIdToCode() {
        return virtualIdToCode
      },
      getComponent(componentName) {
        return options.components?.find((c) => c.name === componentName)
      },
      moduleMayHaveIframe(id, code) {
        return (
          !id.includes('__whyframe:') &&
          !id.includes('__whyframe-') &&
          (code.includes('<iframe') ||
            !!options.components?.some((c) => code.includes(`<${c.name}`)))
        )
      },
      getDefaultShowSource() {
        return options.defaultShowSource ?? false
      },
      getMainIframeAttrs(entryId, hash, source, isComponent) {
        /** @type {import('../..').Attr[]} */
        const attrs = []
        attrs.push({
          type: 'static',
          name: isComponent ? '_why?.src' : 'src',
          value: options.defaultSrc || '/' + templateDefaultId
        })
        if (isBuild) {
          hashToEntryIds.set(hash, entryId)
          attrs.push({
            type: 'static',
            name: isComponent ? '_why?.id' : 'data-why-id',
            value: hash
          })
        } else {
          attrs.push({
            type: 'static',
            name: isComponent ? '_why?.id' : 'data-why-id',
            value: `/@id/__${entryId}`
          })
        }
        if (source) {
          attrs.push({
            type: 'static',
            name: isComponent ? '_why?.source' : 'data-why-source',
            value: source
          })
        }
        if (isComponent) {
          const whyProp = {}
          for (const attr of attrs) {
            whyProp[attr.name.slice('_why?.'.length)] = attr.value
          }
          return [
            {
              type: 'dynamic',
              name: '_why',
              value: whyProp
            }
          ]
        } else {
          return attrs
        }
      },
      getProxyIframeAttrs() {
        /** @type {import('../..').Attr[]} */
        return [
          {
            type: 'dynamic',
            name: 'src',
            value: `_why?.src || ${JSON.stringify(
              options.defaultSrc || '/' + templateDefaultId
            )}`
          },
          {
            type: 'dynamic',
            name: 'data-why-id',
            value: '_why?.id'
          },
          {
            type: 'dynamic',
            name: 'data-why-source',
            value: '_why?.source'
          }
        ]
      },
      createEntry(originalId, hash, ext, code) {
        // example: whyframe:entry-123456.jsx
        const entryId = `whyframe:entry-${hash}${ext}`
        virtualIdToCode.set(entryId, code)
        trackVirtualId(originalId, entryId)
        return entryId
      },
      createEntryComponent(originalId, hash, ext, code) {
        // example: /User/bjorn/foo/bar/App.svelte__whyframe-123456.svelte
        const entryComponentId = `${originalId}__whyframe-${hash}${ext}`
        virtualIdToCode.set(entryComponentId, code)
        trackVirtualId(originalId, entryComponentId)
        return entryComponentId
      },
      createEntryMetadata(originalId, iframeName, code) {
        // example: whyframe:iframe-{iframeName?}__{importer}
        const iframeNamePrepend = iframeName ? `-${iframeName}` : ''
        const iframeId = `whyframe:iframe${iframeNamePrepend}__${originalId}`
        virtualIdToCode.set(iframeId, code)
        trackVirtualId(originalId, iframeId)
        return iframeId
      }
    },
    resolveId(id, importer) {
      // see createEntry for id signature
      if (id.startsWith('whyframe:entry')) {
        return '__' + id
      }
      // see createEntryComponent for id signature
      if (id.includes('__whyframe-')) {
        // NOTE: this gets double resolved for some reason
        if (id.startsWith(projectRoot)) {
          return id
        } else {
          return path.join(projectRoot, id)
        }
      }
      // see createIframeMetadata for id signature
      if (id.startsWith('whyframe:iframe-')) {
        return '__' + id + '__' + importer
      }
    },
    async load(id) {
      let virtualId
      // see createEntry for id signature
      if (id.startsWith('__whyframe:entry')) {
        virtualId = id.slice(2)
      }
      // see createEntryComponent for id signature
      if (id.includes('__whyframe-')) {
        virtualId = id
      }
      // see createIframeMetadata for id signature
      if (id.startsWith('__whyframe:iframe-')) {
        virtualId = id.slice(2)
      }
      if (virtualId) {
        let code = virtualIdToCode.get(virtualId)
        // support lazy code
        if (typeof code === 'function') {
          code = code()
          if (code instanceof Promise) {
            code = await code
          }
          virtualIdToCode.set(virtualId, code)
        }
        // handle rollup result, no sourcemap needed as it's not mapping to anything
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
        // @ts-ignore
        for (const id of staleVirtualIds) {
          virtualIdToCode.delete(id)
        }
        originalIdToVirtualIds.delete(file)
      }
    }
  }
}
