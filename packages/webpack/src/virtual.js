import path from 'node:path'
import { fileURLToPath } from 'node:url'
import VirtualModulesPlugin from 'webpack-virtual-modules'

const virtualFsPrefix = path.join(process.cwd(), '__whyframe_virtual__')

/**
 * @param {import('webpack').Compiler} compiler
 */
export function makeCreateVirtualModuleFn(compiler) {
  const virtualIdToResolvedId = new Map()
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
    ctx.normalModuleFactory.hooks.beforeResolve.tap(
      'VirtualResolvePlugin',
      (data) => {
        if (virtualIdToResolvedId.has(data.request)) {
          data.request = virtualIdToResolvedId.get(data.request)
        }
      }
    )
  })

  // load virtual modules with a custom loader
  compiler.options.module.rules.unshift({
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
   * @param {string} id
   * @param {string} code
   */
  return function createVirtualModule(id, code) {
    // webpack needs a full valid fs path
    const resolvedId = virtualFsPrefix + encodeURIComponent(id)
    virtualIdToResolvedId.set(id, resolvedId)
    resolvedIdToCode.set(resolvedId, code)
    // write the virtual module to fs so webpack don't panic
    vmp.writeModule(resolvedId, '')
  }
}
