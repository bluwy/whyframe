/**
 * @returns {import('vite').Plugin}
 */
export function corePlugin() {
  /** @type {boolean} */
  let isBuild
  /** @type {import('..').Api} */
  let api

  return {
    name: 'whyframe:core',
    config(_, { command }) {
      isBuild = command === 'build'
    },
    configResolved(c) {
      api = c.plugins.find((p) => p.name === 'whyframe:api')?.api
      if (!api) {
        // TODO: maybe fail safe
        throw new Error('whyframe() plugin is not installed')
      }
    },
    resolveId(id) {
      if (id === 'whyframe:app') {
        return '\0whyframe:app'
      }
      if (id === 'whyframe:build-data') {
        return '\0whyframe:build-data'
      }
    },
    async load(id) {
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
            const info = this.getModuleInfo(id)
            if (info?.isExternal) continue
            modulesToWait.push(this.load({ id }).catch(() => {}))
          }
          // TODO: timeout if too long
          await Promise.all(modulesToWait)
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

const devCode = `\
export async function createApp(el) {
  const url = window.frameElement.dataset.whyId
  const data = await import(/* @vite-ignore */ url)
  const result = await data.createApp(el)
  return result
}`

const buildCode = `\
import hashToImportMap from 'whyframe:build-data'
export async function createApp(el) {
  const hash = window.frameElement.dataset.whyId
  const importApp = hashToImportMap[hash]
  if (!importApp) throw new Error('no app found')
  const data = await importApp()
  const result = await data.createApp(el)
  return result
}`
