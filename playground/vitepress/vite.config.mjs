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
      }
    }),
    whyframeVue({
      include: /\.(?:vue|md)$/
    })
  ],
  ssr: {
    format: 'cjs'
  },
  legacy: {
    buildSsrCjsExternalHeuristics: true
  },
  optimizeDeps: {
    // vitepress is aliased with replacement `join(DIST_CLIENT_PATH, '/index')`
    // This needs to be excluded from optimization
    exclude: ['vitepress']
  }
})
