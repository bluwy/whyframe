/** @type {import('../loader').default} */
module.exports = async function whyframeJsxLoader(code, map, meta) {
  const callback = this.async()

  const options = this.getOptions()
  const { transform, guessFrameworkFromTsconfig } = await import('./shared.js')

  const fallbackFramework =
    options?.defaultFramework || guessFrameworkFromTsconfig()

  const plugins = this._compilation?.options.plugins
  /** @type {import('@whyframe/core').Api} */
  // @ts-ignore
  const api = plugins?.find((p) => p.constructor.name === 'WhyframePlugin')
  if (!api) {
    callback(new Error('new Whyframe() plugin is not installed'))
    return
  }

  const transformed = transform(code, this.resource, api, {
    fallbackFramework,
    parserOptions: options?.parserOptions
  })
  if (transformed) {
    callback(undefined, transformed.code, transformed.map, meta)
  } else {
    callback(undefined, code, map, meta)
  }
}
