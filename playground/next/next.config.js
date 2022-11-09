import { WhyframePlugin } from '@whyframe/core/webpack'

/** @type {import('next').NextConfig} */
export default {
  experimental: {
    appDir: true
  },
  webpack(config) {
    config.plugins.unshift(
      new WhyframePlugin({
        defaultSrc: '/frames/default',
        components: [{ name: 'Story', showSource: true }]
      })
    )
    config.module.rules.push({
      test: /\.[jt]sx$/,
      exclude: /node_modules/,
      use: [
        {
          loader: '@whyframe/jsx/loader',
          options: {
            defaultFramework: 'react'
          }
        }
      ]
    })
    return config
  }
}
