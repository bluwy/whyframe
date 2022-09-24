import { makeCreateVirtualModuleFn } from './virtual.js'

export class WhyframePlugin {
  /**
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    const createVirtualModule = makeCreateVirtualModuleFn(compiler)

    // load whyframe:app
    compiler.hooks.compilation.tap('WhyframePlugin', (compilation) => {
      createVirtualModule(
        'whyframe:app',
        `\
// import hashToImportMap from 'whyframe:build-data'
export async function createApp(el) {
  // const hash = window.frameElement.dataset.whyId
  // const importApp = hashToImportMap[hash]
  // if (!importApp) throw new Error('no app found')
  // const data = await importApp()
  // const result = await data.createApp(el)
  // return result
}`
      )
    })
  }
}
