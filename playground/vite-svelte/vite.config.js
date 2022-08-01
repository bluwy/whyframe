import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { whyframeSvelte } from '@whyframe/svelte'

export default defineConfig({
  plugins: [inspect(), whyframeSvelte(), svelte()]
})
