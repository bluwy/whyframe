/** @type {import('../docusaurus').default} */
module.exports = async function whyframe(_, options) {
  const { WhyframePlugin } = await import('@whyframe/core/webpack')
  return {
    name: 'docusaurus-plugin-whyframe',
    configureWebpack() {
      const { parserOptions, ...pluginOptions } = options

      return {
        mergeStrategy: { plugins: 'prepend' },
        plugins: [new WhyframePlugin(pluginOptions)],
        module: {
          rules: [
            {
              test: /\.jsx?$/,
              exclude: /node_modules/,
              use: [
                {
                  loader: '@whyframe/jsx/loader',
                  options: {
                    defaultFramework: 'react17',
                    parserOptions
                  }
                }
              ]
            }
          ]
        }
      }
    }
  }
}
