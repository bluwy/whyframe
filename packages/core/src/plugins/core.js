import { isBuiltin } from 'node:module'

/**
 * @returns {import('vite').Plugin}
 */
export function corePlugin() {
  /** @type {boolean} */
  let isBuild
  /** @type {import('../..').Api} */
  let api

  return {
    name: 'whyframe:core',
    config(_, { command }) {
      isBuild = command === 'build'
      return {
        optimizeDeps: {
          include: ['@whyframe/core/utils']
        }
      }
    },
    configResolved(c) {
      api = c.plugins.find((p) => p.name === 'whyframe:api')?.api
      if (!api) {
        // TODO: maybe fail safe
        throw new Error('whyframe() plugin is not installed')
      }
    },
    resolveId: {
      filter: {
        id: [/^whyframe:app$/, /^whyframe:build-data$/]
      },
      handler(id) {
        if (id === 'whyframe:app') {
          return '\0whyframe:app'
        }
        if (id === 'whyframe:build-data') {
          return '\0whyframe:build-data'
        }
      }
    },
    load: {
      filter: {
        id: [/^\0whyframe:app$/, /^\0whyframe:build-data$/]
      },
      async handler(id) {
        if (id === '\0whyframe:app') {
          return isBuild ? buildCode : devCode
        }
        if (id === '\0whyframe:build-data') {
          // wait for all modules loaded before getting the entry ids
          const seen = new Set()
          let modulesToWait = []
          do {
            modulesToWait = []
            for (const id of this.getModuleIds()) {
              if (seen.has(id)) continue
              seen.add(id)
              if (id.startsWith('\0')) continue
              if (isBuiltin(id)) continue
              if (api._getSkipWaitIds().some((r) => r.test(id))) continue
              const info = this.getModuleInfo(id)
              // @ts-expect-error isExternal doesn't exist in rolldown
              if (info?.isExternal) continue
              modulesToWait.push(this.load({ id }).catch(() => {}))
            }
            const timeout = timeoutPromise(15000)
            await Promise.race([Promise.all(modulesToWait), timeout.promise])
            timeout.cancel()
            if (timeout.timedOut) break
          } while (modulesToWait.length > 0)

          // generate hash to import map
          const hashToId = api._getHashToEntryIds()
          let final = ''
          for (const [hash, id] of hashToId) {
            final += `"${hash}": () => import("${id}"), `
          }
          return `export default {${final}}`
        }
      }
    }
  }
}

const devCode = `\
export async function createApp(el, opts) {
  const iframe = window.frameElement
  if (!iframe) throw new Error('[whyframe] page is not within an iframe')
  const url = iframe.dataset.whyId
  if (!url) throw new Error('[whyframe] iframe does not have an id')
  const data = await import(/* @vite-ignore */ url)
  const result = await data.createApp(el, opts)
  return result
}
if (typeof window !== 'undefined' && window.frameElement) {
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'data-why-id') {
        window.location.reload()
      }
    }
  }).observe(window.frameElement, { attributes: true })
}`

const buildCode = `\
import hashToImportMap from 'whyframe:build-data'
export async function createApp(el, opts) {
  const iframe = window.frameElement
  if (!iframe) throw new Error('[whyframe] page is not within an iframe')
  const hash = iframe.dataset.whyId
  if (!hash) throw new Error('[whyframe] iframe does not have an id')
  const importApp = hashToImportMap[hash]
  if (!importApp) throw new Error('[whyframe] no app found')
  const data = await importApp()
  const result = await data.createApp(el, opts)
  return result
}`

/**
 * @param {number} ms
 */
function timeoutPromise(ms) {
  let timeoutId
  const returned = {
    promise: /** @type {Promise<void>} */ (
      new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          returned.timedOut = true
          resolve()
        }, ms)
      })
    ),
    timedOut: false,
    cancel() {
      clearTimeout(timeoutId)
    }
  }
  return returned
}
