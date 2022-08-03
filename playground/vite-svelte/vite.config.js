import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { whyframe } from '@whyframe/core'
import { whyframeSvelte } from '@whyframe/svelte'

export default defineConfig({
  plugins: [
    inspect(),
    whyframe({
      templateHtml: {
        basic: './src/frames/basic/index.html'
      }
    }),
    whyframeSvelte(),
    svelte()
  ]
})
