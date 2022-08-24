import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import { whyframe } from '@whyframe/core'
import { whyframeVue } from '@whyframe/vue'

export default defineConfig({
  plugins: [
    inspect(),
    whyframe({
      template: {
        default: '/frames/basic', // vitepress doesn't support whyframe default template
        basic: '/frames/basic'
      },
      components: ['Story']
    }),
    whyframeVue({
      include: /\.(?:vue|md)$/
    })
  ]
})
