import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { whyframe } from '@whyframe/core'
import { whyframeVue } from '@whyframe/vue'

export default defineConfig({
  plugins: [whyframe(), whyframeVue(), vue()],
  build: {
    rollupOptions: {
      input: {
        framesSpecial: 'frames/special.html',
        index: 'index.html'
      }
    }
  }
})
