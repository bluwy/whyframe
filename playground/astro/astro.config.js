import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import inspect from 'vite-plugin-inspect'
import { whyframe } from '@whyframe/core'
import { whyframeAstro } from '@whyframe/astro'

export default defineConfig({
  integrations: [svelte()],
  vite: {
    plugins: [
      inspect(),
      whyframe({
        template: {
          basic: '/frames/basic'
        }
      }),
      whyframeAstro()
    ]
  }
})
