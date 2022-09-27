import path from 'node:path'
import { fileURLToPath } from 'node:url'
import VirtualModulesPlugin from 'webpack-virtual-modules'

const virtualFsPrefix = path.join(process.cwd(), '__whyframe_virtual__')

/**
 * @param {import('webpack').Compiler} compiler
 */
export function makeWriteVirtualModuleFn(compiler) {
  /** @type {Map<string, string>} */
  const virtualIdToResolvedId = new Map()
  /** @type {Map<string, string | Promise<string>>} */
  const resolvedIdToCode = new Map()

  /** @type {VirtualModulesPlugin} */
  // @ts-ignore
  let vmp = compiler.options.plugins.find(
    (p) => p instanceof VirtualModulesPlugin
  )
  if (!vmp) {
    vmp = new VirtualModulesPlugin()
    vmp.apply(compiler)
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

          /** @type {string | Promise<string>} */
          // @ts-ignore
          const code = resolvedIdToCode.get(resolvedId)

          if (typeof code !== 'string') {
            code
              .then((actualCode) => {
                // set to string so that the virtual loader can be sync only
                resolvedIdToCode.set(resolvedId, actualCode)
                callback()
              })
              .catch((err) => {
                callback(err)
              })
            return
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

  /**
   * create or update virtual modules
   * @param {string} id
   * @param {string | Promise<string>} code
   */
  return function writeVirtualModule(id, code) {
    // webpack needs a full valid fs path
    const resolvedId = path.isAbsolute(id)
      ? id
      : virtualFsPrefix + encodeURIComponent(id)
    virtualIdToResolvedId.set(id, resolvedId)
    resolvedIdToCode.set(resolvedId, code)
    // write the virtual module to fs so webpack don't panic
    vmp.writeModule(resolvedId, '')
  }
}
