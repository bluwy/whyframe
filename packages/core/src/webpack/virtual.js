import path from 'node:path'
import { fileURLToPath } from 'node:url'
import VirtualModulesPlugin from './virtualModule.js'
import { MapWithCache } from './mapWithCache.js'

const virtualFsPrefix = path.join(process.cwd(), '__whyframe_virtual__')
const cache1 = path.join(
  process.cwd(),
  './node_modules/.cache/whyframe/cache1.json'
)
const cache2 = path.join(
  process.cwd(),
  './node_modules/.cache/whyframe/cache2.json'
)

/**
 * @param {import('webpack').Compiler} compiler
 */
export function createVirtualModuleManager(compiler) {
  const needCache =
    compiler.options.cache && compiler.options.cache.type === 'filesystem'

  /** @type {Map<string, string>} */
  const virtualIdToResolvedId = new MapWithCache(needCache ? cache1 : undefined)
  /** @type {Map<string, string>} */
  const resolvedIdToCode = new MapWithCache(needCache ? cache2 : undefined)
  /** @type {Map<string, Promise<string | undefined> | (() => string | undefined | Promise<string | undefined>)>} */
  const resolvedIdToCodeTemp = new Map()

  /** @type {VirtualModulesPlugin} */
  // @ts-ignore
  let vmp = compiler.options.plugins.find(
    (p) => p instanceof VirtualModulesPlugin
  )
  if (!vmp) {
    vmp = new VirtualModulesPlugin()
    vmp.apply(compiler)
  }

  // init cache virtual modules so can be resolved
  if (needCache && resolvedIdToCode.size > 0) {
    compiler.hooks.compilation.tap('VirtualResolvePluginInit', (_, ctx) => {
      for (const resolvedId of resolvedIdToCode.keys()) {
        vmp.writeModule(resolvedId, '')
      }
    })
  }

  // resolve virtual id to resolved id
  compiler.hooks.compilation.tap('VirtualResolvePlugin', (_, ctx) => {
    ctx.normalModuleFactory.hooks.beforeResolve.tapAsync(
      'VirtualResolvePlugin',
      (data, callback) => {
        if (virtualIdToResolvedId.has(data.request)) {
          /** @type {string} */
          // @ts-ignore
          const resolvedId = virtualIdToResolvedId.get(data.request)
          data.request = resolvedId

          if (resolvedIdToCodeTemp.has(resolvedId)) {
            /** @type {any} */
            let temp = resolvedIdToCodeTemp.get(resolvedId)
            if (typeof temp === 'function') {
              temp = temp()
            }
            if (temp instanceof Promise) {
              temp
                .then((code) => {
                  if (code) {
                    resolvedIdToCode.set(resolvedId, code)
                    resolvedIdToCodeTemp.delete(resolvedId)
                  }
                  callback()
                })
                .catch((err) => {
                  callback(err)
                })
              return
            } else if (temp) {
              resolvedIdToCode.set(resolvedId, temp)
              resolvedIdToCodeTemp.delete(resolvedId)
            }
          }
        }
        callback()
      }
    )
  })

  // load virtual modules with a custom loader
  compiler.options.module.rules.push({
    include: (id) => resolvedIdToCode.has(id),
    use: [
      {
        // webpack only supports cjs loader
        // https://github.com/webpack/loader-runner/issues/61
        loader: fileURLToPath(new URL('./virtualLoader.cjs', import.meta.url)),
        options: {
          resolvedIdToCode
        }
      }
    ]
  })

  return {
    /**
     * create or update a virtual module
     * @param {string} id
     * @param {string | undefined | Promise<string | undefined> | (() => string | undefined | Promise<string | undefined>)} code
     */
    set(id, code) {
      // webpack needs a full valid fs path
      const resolvedId = resolveVirtualId(id)
      virtualIdToResolvedId.set(id, resolvedId)
      if (typeof code === 'string') {
        resolvedIdToCode.set(resolvedId, code)
      } else if (code) {
        resolvedIdToCodeTemp.set(resolvedId, code)
      }
      // write the virtual module to fs so webpack don't panic
      vmp.writeModule(resolvedId, '')
    },
    /**
     * delete a virtual module
     * @param {string} id
     */
    delete(id) {
      virtualIdToResolvedId.delete(id)
      resolvedIdToCode.delete(resolveVirtualId(id))
    }
  }
}

/**
 * @param {string} id
 */
export function resolveVirtualId(id) {
  return path.isAbsolute(id) ? id : virtualFsPrefix + encodeURIComponent(id)
}
