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

  // wait for all modules loaded (best effort) before generating
  // final import map for `whyframe:app-${templateName}`
  /** @type {Promise<any> | undefined} */
  let allModulesLoaded

  return {
    name: 'whyframe:core',
    config(c, { command }) {
      isBuild = command === 'build'
      if (isBuild) {
        const haveExistingInput = c.build?.rollupOptions?.input
        const input = haveExistingInput ? {} : { index: 'index.html' }

        // add each template as input for Vite to process
        if (options?.template) {
          for (const [key, value] of Object.entries(options.template)) {
            input[`whyframe-template-${key}`] = value
          }
        }
        // also write builtin default template if user didn't specify their own
        if (!options?.template || !options.template.default) {
          input['whyframe-template-default'] = templateDefaultBuildPath
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

        // For builds, things get complicated. We need to wait for all
        // files to be loaded, then we can
        const templateName = id.slice('\0whyframe:app-'.length)

        // wait for all modules loaded before getting the entry ids related to
        // this template
        allModulesLoaded ??= waitForAllModulesLoaded(this)

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

async function waitForAllModulesLoaded(ctx) {
  const seen = new Set()
  let modulesToWait = []
  do {
    modulesToWait = []
    for (const id of ctx.getModuleIds()) {
      if (seen.has(id)) continue
      seen.add(id)
      if (id.startsWith('\0')) continue
      modulesToWait.push(ctx.load({ id }))
    }
    // TODO: timeout if too long
    await Promise.all(modulesToWait)
  } while (modulesToWait.length > 0)
}

const devCode = `\
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
  const data = await import(/* @vite-ignore */ window.__whyframe_app_url)
  const result = await data.createApp(el)
  isReadying = false
  return result
}

if (import.meta.hot) {
  import.meta.hot.accept(() => {
    isReadying = false // an error may happen in ready, so we reset to remount the app
  })
}`

const buildCode = `\
let isReadying = false

const hashToImportMap = __whyframe_hash_to_import_map__

export async function createApp(el) {
  if (isReadying) return
  isReadying = true

  return new Promise((resolve, reject) => {
    if (window.__whyframe_app_hash) {
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
  const app = hashToImportMap[window.__whyframe_app_hash]
  if (!app) throw new Error('no app found')
  const data = await app()
  const result = await data.createApp(el)
  isReadying = false
  return result
}`
