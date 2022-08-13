import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import vue from '@astrojs/vue'
import solid from '@astrojs/solid-js'
import preact from '@astrojs/preact'
import react from '@astrojs/react'
import inspect from 'vite-plugin-inspect'
import { whyframe } from '@whyframe/core'
import { whyframeAstro } from '@whyframe/astro'
import { whyframeSvelte } from '@whyframe/svelte'
import { whyframeVue } from '@whyframe/vue'
import { whyframeJsx } from '@whyframe/jsx'

export default defineConfig({
  integrations: [svelte(), vue(), solid(), preact(), react()],
  vite: {
    plugins: [
      inspect(),
      whyframe({
        template: {
          basic: '/frames/basic'
        }
      }),
      whyframeAstro({
        defaultFramework: 'svelte',
        components: [{ name: 'Story', path: './src/components/Story.astro' }]
      }),
      whyframeSvelte(),
      whyframeVue(),
      // what mad man
      whyframeJsx({
        include: /\.solid\.jsx$/,
        framework: 'solid'
      }),
      whyframeJsx({
        include: /\.preact\.jsx$/,
        framework: 'preact'
      }),
      whyframeJsx({
        include: /\.react\.jsx$/,
        framework: 'react'
      })
    ]
  }
})
