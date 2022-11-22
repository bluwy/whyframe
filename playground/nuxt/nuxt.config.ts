import { whyframe } from '@whyframe/core'
import { whyframeVue } from '@whyframe/vue'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Nuxt + Whyframe',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/nuxt.svg' }]
    }
  },
  vite: {
    plugins: [
      whyframe({
        defaultSrc: '/frames/default', // nuxt doesn't support whyframe default template in build
        components: [{ name: 'Story', showSource: true }]
      }),
      whyframeVue({
        nuxtCompat: true
      })
    ]
  }
})
