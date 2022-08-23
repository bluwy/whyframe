import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import react from '@vitejs/plugin-react'
import { whyframe } from '@whyframe/core'
import { whyframeJsx } from '@whyframe/jsx'

export default defineConfig({
  plugins: [
    inspect(),
    whyframe({
      template: {
        basic: '/frames/basic/index.html'
      },
      components: ['Story']
    }),
    whyframeJsx({
      framework: 'react',
    }),
    react()
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
