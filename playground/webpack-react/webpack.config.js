import path from 'node:path'
import HtmlWebpackPlugin from 'html-webpack-plugin'

/** @type {import('webpack').Configuration} */
export default {
  mode: process.env.WEBPACK_SERVE ? 'development' : 'production',
  entry: './src/main.jsx',
  output: {
    path: path.resolve('./dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
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
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
}
