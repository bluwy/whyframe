import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import { whyframe } from '@whyframe/core'
import { whyframeVue } from '@whyframe/vue'

export default defineConfig({
  plugins: [
    inspect(),
    whyframe({
      template: {
        basic: '/frames/basic/index.html'
      }
    }),
    whyframeVue({
      include: /\.(?:vue|md)$/
    })
  ]
})
