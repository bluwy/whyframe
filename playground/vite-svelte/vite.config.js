import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { whyframe } from '@whyframe/core'
import { whyframeSvelte } from '@whyframe/svelte'

export default defineConfig({
  plugins: [
    inspect(),
    whyframe({
      components: [{ name: 'Story', showSource: true }]
    }),
    whyframeSvelte(),
    svelte()
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
