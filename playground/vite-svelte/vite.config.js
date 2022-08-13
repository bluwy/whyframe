import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { whyframe } from '@whyframe/core'
import { whyframeSvelte } from '@whyframe/svelte'

export default defineConfig({
  plugins: [
    inspect(),
    whyframe({
      template: {
        basic: '/frames/basic/index.html'
      }
    }),
    whyframeSvelte({
      components: [{ name: 'Story', path: './src/Story.svelte' }]
    }),
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
