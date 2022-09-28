import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import solid from 'vite-plugin-solid'
import { whyframe } from '@whyframe/core'
import { whyframeJsx } from '@whyframe/jsx'

export default defineConfig({
  plugins: [
    inspect(),
    whyframe({
      components: [{ name: 'Story', showSource: true }]
    }),
    whyframeJsx({
      defaultFramework: 'solid'
    }),
    solid()
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
