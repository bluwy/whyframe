import { defineNuxtConfig } from 'nuxt'
// import inspect from 'vite-plugin-inspect'
import { whyframe } from '@whyframe/core'
import { whyframeVue } from '@whyframe/vue'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  vite: {
    plugins: [
      // inspect(),
      whyframe({
        defaultSrc: '/frames/basic', // nuxt doesn't support whyframe default template in build
        components: [{ name: 'Story', showSource: true }]
      }),
      whyframeVue()
    ]
  }
})
