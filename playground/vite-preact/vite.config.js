import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import preact from '@preact/preset-vite'
import { whyframe } from '@whyframe/core'
import { whyframeJsx } from '@whyframe/jsx'

export default defineConfig({
  plugins: [
    inspect(),
    whyframe({
      template: {
        basic: '/frames/basic/index.html'
      }
    }),
    whyframeJsx({
      framework: 'preact',
      components: [{ name: 'Story', path: './src/Story.jsx', export: 'Story' }]
    }),
    preact()
  ],
  build: {
    rollupOptions: {
      input: {
        whyframeBasic: 'frames/basic/index.html',
        index: 'index.html'
      }
    }
  }
})
