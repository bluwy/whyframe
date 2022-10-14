const path = require('path')

/** @type {import('../docusaurus').default} */
module.exports = async function whyframe(_, options) {
  const { WhyframePlugin } = await import('@whyframe/core/webpack')
  const { parserOptions, defaultSrc, ...pluginOptions } = options
  return {
    name: 'docusaurus-plugin-whyframe',
    configureWebpack() {
      return {
        mergeStrategy: { plugins: 'prepend' },
        plugins: [
          new WhyframePlugin({
            ...pluginOptions,
            defaultSrc: defaultSrc || '/__whyframe'
          }),
          new WhyframeDocusaurusPlugin(parserOptions)
        ],
        module: {
          rules: [
            {
              test: /\.[jt]sx?$/,
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
    },
    contentLoaded({ actions }) {
      if (!defaultSrc) {
        actions.addRoute({
          path: '/__whyframe',
          component: path.resolve(__dirname, './docusaurusTemplate.jsx'),
          exact: true
        })
      }
    }
  }
}

class WhyframeDocusaurusPlugin {
  #parserOptions

  /**
   * @param {import('@babel/parser').ParserOptions} [parserOptions]
   */
  constructor(parserOptions) {
    this.#parserOptions = parserOptions
  }

  /**
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    // inject jsx rule between the babel loader and docusaurus mdx loader
    // so that we can process jsx exactly. mdx -> (whyframe) -> babel.
    for (const rule of compiler.options.module.rules) {
      if (
        // @ts-ignore
        rule.use?.[0]?.loader?.includes('babel-loader') &&
        // @ts-ignore
        rule.use?.[1]?.loader?.includes('@docusaurus/mdx-loader')
      ) {
        // @ts-ignore
        rule.use.splice(1, 0, {
          loader: '@whyframe/jsx/loader',
          options: {
            defaultFramework: 'react17',
            parserOptions: this.#parserOptions
          }
        })
      }
    }
  }
}
