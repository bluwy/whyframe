import path from 'node:path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { WhyframePlugin } from '@whyframe/core/webpack'

const isDev = !!process.env.WEBPACK_SERVE

/** @type {import('webpack').Configuration} */
export default {
  mode: isDev ? 'development' : 'production',
  entry: {
    index: './src/main.jsx',
    framesBasicIndex: './frames/basic/main.js'
  },
  output: {
    path: path.resolve('./dist')
  },
  plugins: [
    new WhyframePlugin({
      defaultSrc: '/frames/basic/index.html',
      components: [{ name: 'Story', showSource: true }]
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      filename: 'frames/basic/index.html',
      template: './frames/basic/index.html',
      chunks: ['framesBasicIndex']
    }),
    new MiniCssExtractPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.[jt]sx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-react',
                  {
                    runtime: 'automatic'
                  }
                ]
              ]
            }
          },
          {
            loader: '@whyframe/jsx/loader',
            options: {
              defaultFramework: 'react'
            }
          }
        ]
      },
      {
        test: /\.css$/i,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  }
}
