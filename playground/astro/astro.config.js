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
  integrations: [
    svelte(),
    vue(),
    solid({ include: ['**/*Solid*'] }),
    preact({ include: ['**/*Preact*'] }),
    react({ include: ['**/*React*'] })
  ],
  vite: {
    plugins: [
      inspect(),
      whyframe({
        defaultSrc: '/frames/default',
        components: [{ name: 'Story', showSource: true }]
      }),
      whyframeAstro({
        defaultFramework: 'svelte'
      }),
      whyframeSvelte(),
      whyframeVue(),
      whyframeJsx()
    ]
  }
})
