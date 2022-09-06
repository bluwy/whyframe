import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import { whyframe } from '@whyframe/core'
import { whyframeVue } from '@whyframe/vue'

export default defineConfig({
  plugins: [
    inspect(),
    whyframe({
      defaultSrc: '/frames/basic', // vitepress doesn't support whyframe default html
      components: [{ name: 'Story', showSource: true }]
    }),
    whyframeVue({
      include: /\.(?:vue|md)$/
    })
  ]
})
