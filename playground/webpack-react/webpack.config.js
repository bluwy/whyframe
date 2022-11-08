import path from 'node:path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { WhyframePlugin } from '@whyframe/core/webpack'
import CopyPlugin from 'copy-webpack-plugin'

const isDev = !!process.env.WEBPACK_SERVE

/** @type {import('webpack').Configuration} */
export default {
  mode: isDev ? 'development' : 'production',
  entry: {
    framesDefault: './frames/default/main.js',
    framesSpecial: './frames/special/main.js',
    index: './src/main.jsx'
  },
  output: {
    path: path.resolve('./dist')
  },
  resolve: {
    extensions: ['...', '.jsx']
  },
  plugins: [
    new WhyframePlugin({
      defaultSrc: '/frames/default/index.html',
      components: [{ name: 'Story', showSource: true }]
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      filename: 'frames/default/index.html',
      template: './frames/default/index.html',
      chunks: ['framesDefault']
    }),
    new HtmlWebpackPlugin({
      filename: 'frames/special/index.html',
      template: './frames/special/index.html',
      chunks: ['framesSpecial']
    }),
    new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: ['public']
    })
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
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  }
}
