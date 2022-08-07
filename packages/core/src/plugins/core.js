import { templateDefaultBuildPath } from './template.js'

/**
 * @param {import('..').Options} [options]
 * @returns {import('vite').Plugin}
 */
export function corePlugin(options) {
  /** @type {boolean} */
  let isBuild

  /** @type {import('..').Api} */
  let api

  return {
    name: 'whyframe:core',
    config(c, { command }) {
      isBuild = command === 'build'
      // write default template if user didn't specify their own
      if (isBuild && !options?.template?.default) {
        const haveExistingInput = c.build?.rollupOptions?.input
        const input = haveExistingInput ? {} : { index: 'index.html' }
        input['whyframe-template-default'] = templateDefaultBuildPath
        return {
          build: {
            rollupOptions: {
              input
            }
          }
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
    resolveId(id) {
      if (id.startsWith('whyframe:app')) {
        return '\0' + id
      }
    },
    async load(id) {
      if (id.startsWith('\0whyframe:app')) {
        // use simplified implementation in dev
        if (!isBuild) return devCode

        const templateName = id.slice('\0whyframe:app-'.length)

        // wait for all modules loaded before getting the entry ids
        // related to this template
        // NOTE: sharing this between templates doesn't seem to wait long enough
        const seen = new Set()
        let modulesToWait = []
        do {
          modulesToWait = []
          for (const id of this.getModuleIds()) {
            if (seen.has(id)) continue
            seen.add(id)
            if (id.startsWith('\0')) continue
            modulesToWait.push(this.load({ id }))
          }
          // TODO: timeout if too long
          await Promise.all(modulesToWait)
        } while (modulesToWait.length > 0)

        // generate hash to import map
        const hashToId = api._getEntryIds(templateName)
        let final = ''
        for (const [hash, id] of Object.entries(hashToId)) {
          final += `"${hash}": () => import("${id}"), `
        }
        final = `{${final}}`

        return buildCode.replace('__whyframe_hash_to_import_map__', final)
      }
    }
  }
}

const devCode = `\
export async function createApp(el) {
  const url = window.frameElement.dataset.whyframeAppUrl
  const data = await import(/* @vite-ignore */ url)
  const result = await data.createApp(el)
  return result
}`

const buildCode = `\
const hashToImportMap = __whyframe_hash_to_import_map__
export async function createApp(el) {
  const hash = window.frameElement.dataset.whyframeAppHash
  const importApp = hashToImportMap[hash]
  if (!importApp) throw new Error('no app found')
  const data = await importApp()
  const result = await data.createApp(el)
  return result
}`
