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
        basic: '/frames/basic'
      }
    }),
    whyframeSvelte(),
    svelte({
      onwarn(warning, handler) {
        // https://github.com/sveltejs/svelte/pull/7768
        if (warning.message.includes('CustomEvent')) return
        handler(warning)
      }
    })
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
