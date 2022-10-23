import path from 'node:path'
import { MapWithCache } from './mapWithCache.js'
import { createVirtualModuleManager, resolveVirtualId } from './virtual.js'

const cache3 = path.join(
  process.cwd(),
  './node_modules/.cache/whyframe/cache3.json'
)

export class WhyframePlugin {
  /** @type {import('../../webpack').Options} */
  #options
  /** @type {ReturnType<typeof import('./virtual').createVirtualModuleManager>} */
  #virtualModuleManager
  // used for final import map generation
  /** @type {Map<string, string>} */
  #hashToEntryIds = new Map()
  // secondary map to track stale virtual ids on hot update
  /** @type {Map<string, string[]>} */
  #originalIdToVirtualIds

  constructor(options = {}) {
    this.#options = options
  }

  /**
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    const needCache =
      compiler.options.cache && compiler.options.cache.type === 'filesystem'

    this.#virtualModuleManager = createVirtualModuleManager(compiler)

    this.#originalIdToVirtualIds = new MapWithCache(
      needCache ? cache3 : undefined
    )

    compiler.hooks.watchRun.tap('WhyframePlugin', ({ modifiedFiles }) => {
      if (modifiedFiles) {
        for (const file of modifiedFiles.keys()) {
          // remove stale virtual ids
          // NOTE: hot update always come first before transform
          if (this.#originalIdToVirtualIds.has(file)) {
            /** @type {string[]} */
            // @ts-ignore
            const staleVirtualIds = this.#originalIdToVirtualIds.get(file)
            for (const id of staleVirtualIds) {
              this.#virtualModuleManager.delete(id)
            }
            for (const [hash, entryId] of this.#hashToEntryIds) {
              if (staleVirtualIds.includes(entryId)) {
                this.#hashToEntryIds.delete(hash)
              }
            }
            this.#originalIdToVirtualIds.delete(file)
          }
        }
      }
    })

    compiler.hooks.compilation.tap('WhyframePlugin', (compilation) => {
      // load whyframe:app
      this.#virtualModuleManager.set('whyframe:app', whyframeAppCode)
      // load whyframe:build-data
      this.#virtualModuleManager.set(
        'whyframe:build-data',
        this.#waitModulesBuilt(compilation, [
          resolveVirtualId('whyframe:build-data')
        ]).then(() => {
          if (this.#hashToEntryIds.size > 0) {
            let final = ''
            for (const [hash, id] of this.#hashToEntryIds) {
              final += `"${hash}": () => import("${id}"), `
            }
            return `export default {${final}}`
          }
        })
      )
    })
  }

  // NOTE: I tried https://stackoverflow.com/questions/35092183/webpack-plugin-how-can-i-modify-and-re-parse-a-module-after-compilation/52906440#52906440
  // but it doesn't process the injected dynamic imports. Presumably all modules are sealed.
  /**
   * @param {import('webpack').Compilation} compilation
   * @param {string[]} excludeModules
   */
  async #waitModulesBuilt(compilation, excludeModules = []) {
    return /** @type {Promise<void>} */ (
      new Promise((resolve) => {
        const processingModules = new Set()
        let verifyEndTimeout

        // bail if no modules started (could happen if webpack cache enabled)
        /** @type {NodeJS.Timeout | undefined} */
        let bailStartTimeout = setTimeout(() => resolve(), 2000)

        // 1. track all building modules
        const startProcessModule = (module) => {
          const resource = module.resource
          if (resource && !excludeModules.includes(resource)) {
            processingModules.add(resource)
            if (bailStartTimeout) {
              // module started, unbail
              clearTimeout(bailStartTimeout)
              bailStartTimeout = undefined
            }
          }
        }
        // 2. untrack modules built (success or fail)
        const finishProcessModule = (module) => {
          const resource = module.resource
          if (resource) {
            processingModules.delete(resource)
            // 3. check if no more modules still building. add timeout as finished
            // modules may import new modules to build.
            // TODO: timeout if too long
            if (verifyEndTimeout) clearTimeout(verifyEndTimeout)
            verifyEndTimeout = setTimeout(() => {
              if (processingModules.size === 0) {
                resolve()
              }
            }, 500)
          }
        }

        // 4. add handlers to compilation hooks
        const n = 'WhyframePlugin'
        compilation.hooks.buildModule.tap(n, startProcessModule)
        compilation.hooks.rebuildModule.tap(n, startProcessModule)
        compilation.hooks.succeedModule.tap(n, finishProcessModule)
        compilation.hooks.failedModule.tap(n, finishProcessModule)
        compilation.hooks.finishRebuildingModule.tap(n, finishProcessModule)
      })
    )
  }

  /** @type {import('../../index').Api['getComponent']} */
  getComponent(componentName) {
    return this.#options.components?.find((c) => c.name === componentName)
  }

  /** @type {import('../../index').Api['moduleMayHaveIframe']} */
  moduleMayHaveIframe(id, code) {
    return (
      !id.includes('__whyframe:') &&
      !id.includes('__whyframe-') &&
      (code.includes('<iframe') ||
        !!this.#options.components?.some((c) => code.includes(`<${c.name}`)))
    )
  }

  /** @type {import('../../index').Api['getDefaultShowSource']} */
  getDefaultShowSource() {
    return this.#options.defaultShowSource ?? false
  }

  /** @type {import('../../index').Api['getMainIframeAttrs']} */
  getMainIframeAttrs(entryId, hash, source, isComponent) {
    /** @type {import('../../index').Attr[]} */
    const attrs = []
    attrs.push({
      type: 'static',
      name: isComponent ? '_why?.src' : 'src',
      value: this.#options.defaultSrc || ''
    })
    this.#hashToEntryIds.set(hash, entryId)
    attrs.push({
      type: 'static',
      name: isComponent ? '_why?.id' : 'data-why-id',
      value: hash
    })
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
  }

  /** @type {import('../../index').Api['getProxyIframeAttrs']} */
  getProxyIframeAttrs() {
    /** @type {import('../../index').Attr[]} */
    return [
      {
        type: 'dynamic',
        name: 'src',
        value: `_why?.src || ${JSON.stringify(this.#options.defaultSrc || '')}`
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
  }

  /** @type {import('../../index').Api['createEntry']} */
  createEntry(originalId, hash, ext, code) {
    // example: whyframe:entry-123456.jsx
    const entryId = `whyframe:entry-${hash}${ext}`
    this.#virtualModuleManager.set(entryId, code)
    this.#trackVirtualId(originalId, entryId)
    return entryId
  }

  /** @type {import('../../index').Api['createEntryComponent']} */
  createEntryComponent(originalId, hash, ext, code) {
    // example: /User/bjorn/foo/bar/App.svelte__whyframe-123456.svelte
    const entryComponentId = `${originalId}__whyframe-${hash}${ext}`
    this.#virtualModuleManager.set(entryComponentId, code)
    this.#trackVirtualId(originalId, entryComponentId)
    return entryComponentId
  }

  /** @type {import('../../index').Api['createEntryMetadata']} */
  createEntryMetadata(originalId, iframeName, code) {
    // example: whyframe:iframe-{iframeName?}__{importer}
    const iframeNamePrepend = iframeName ? `-${iframeName}` : ''
    const iframeId = `whyframe:iframe${iframeNamePrepend}__${originalId}`
    this.#virtualModuleManager.set(iframeId, code)
    this.#trackVirtualId(originalId, iframeId)
    return iframeId
  }

  /**
   * @param {string} originalId
   * @param {string} virtualId
   */
  #trackVirtualId(originalId, virtualId) {
    // original id tracking is only needed in dev for hot reloads
    const virtualIds = this.#originalIdToVirtualIds.get(originalId) ?? []
    virtualIds.push(virtualId)
    this.#originalIdToVirtualIds.set(originalId, virtualIds)
  }
}

const whyframeAppCode = `\
import hashToImportMap from 'whyframe:build-data'
export async function createApp(el) {
  const iframe = window.frameElement
  if (!iframe) throw new Error('[whyframe] page is not within an iframe')
  const hash = iframe.dataset.whyId
  if (!hash) throw new Error('[whyframe] iframe does not have an id')
  const importApp = hashToImportMap[hash]
  if (!importApp) throw new Error('[whyframe] no app found')
  const data = await importApp()
  const result = await data.createApp(el)
  return result
}`
