import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import { sveltekit } from '@sveltejs/kit/vite'
import { whyframe } from '@whyframe/core'
import { whyframeSvelte } from '@whyframe/svelte'

export default defineConfig({
  plugins: [
    inspect(),
    sveltekit(),
    whyframe({
      components: [{ name: 'Story', showSource: true }]
    }),
    whyframeSvelte({
      include: /\.(svelte|svx)$/
    })
  ]
})
