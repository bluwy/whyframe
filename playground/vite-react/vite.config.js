import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import react from '@vitejs/plugin-react'
import { whyframe } from '@whyframe/core'
import { whyframeJsx } from '@whyframe/jsx'

export default defineConfig({
  plugins: [
    inspect(),
    whyframe({
      templateHtml: {
        basic: './src/frames/basic/index.html'
      }
    }),
    whyframeJsx({
      framework: 'react'
    }),
    react()
  ]
})
