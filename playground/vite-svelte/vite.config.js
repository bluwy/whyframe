import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { whyframe } from '@whyframe/svelte'

export default defineConfig({
  plugins: [
    inspect(),
    whyframe({ templateHtml: { default: './src/frames/basic/index.html' } }),
    svelte()
  ]
})
