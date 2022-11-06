import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import vue from '@vitejs/plugin-vue'
import { whyframe } from '@whyframe/core'
import { whyframeVue } from '@whyframe/vue'

export default defineConfig({
  plugins: [
    inspect(),
    whyframe({
      components: [{ name: 'Story', showSource: true }]
    }),
    whyframeVue(),
    vue()
  ],
  build: {
    rollupOptions: {
      input: {
        framesSpecial: 'frames/special.html',
        index: 'index.html'
      }
    }
  }
})
