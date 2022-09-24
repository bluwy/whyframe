import path from 'node:path'
import { fileURLToPath } from 'node:url'
import VirtualModulesPlugin from 'webpack-virtual-modules'

/**
 * @param {import('webpack').Compiler} compiler
 */
export function makeCreateVirtualModuleFn(compiler) {
  const idToWrappedId = new Map()
  const wrappedIdToCode = new Map()

  /** @type {VirtualModulesPlugin} */
  // @ts-ignore
  let vmp = compiler.options.plugins.find(
    (p) => p instanceof VirtualModulesPlugin
  )
  if (!vmp) {
    vmp = new VirtualModulesPlugin()
    vmp.apply(compiler)
  }

  // resolve `whyframe:*` virtual paths, ideally this should be generic,
  // but webpack always treats `whyframe:` as a custom URI protocol
  compiler.hooks.compilation.tap('WhyframeUriPlugin', (_, ctx) => {
    ctx.normalModuleFactory.hooks.resolveForScheme
      .for('whyframe')
      .tap('WhyframeUriPlugin', (data) => {
        data.resource = data.path = wrapVirtualId(data.resource)
        return true
      })
  })

  // load virtual modules with a custom loader
  compiler.options.module.rules.unshift({
    include: (id) => wrappedIdToCode.has(id),
    use: [
      {
        loader: fileURLToPath(new URL('./virtualLoader.cjs', import.meta.url)),
        options: {
          wrappedIdToCode
        }
      }
    ]
  })

  /**
   * @param {string} id
   * @param {string} code
   */
  return function createVirtualModule(id, code) {
    const wrappedId = wrapVirtualId(id)
    idToWrappedId.set(id, wrappedId)
    wrappedIdToCode.set(wrappedId, code)
    vmp.writeModule(wrappedId, '')
  }
}

const vmpPrefix = path.join(process.cwd(), '__whyframe_virtual__')

/**
 * @param {string} id
 */
function wrapVirtualId(id) {
  return vmpPrefix + encodeURIComponent(id)
}
