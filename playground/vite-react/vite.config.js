import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import react from '@vitejs/plugin-react'
import { whyframe } from '@whyframe/core'
import { whyframeJsx } from '@whyframe/jsx'

export default defineConfig({
  plugins: [
    inspect(),
    whyframe({
      components: [{ name: 'Story', showSource: true }]
    }),
    whyframeJsx({
      defaultFramework: 'react'
    }),
    react()
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

Error.stackTraceLimit = 100
