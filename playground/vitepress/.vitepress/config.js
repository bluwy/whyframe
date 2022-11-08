import { defineConfig } from 'vitepress'
import inspect from 'vite-plugin-inspect'
import { whyframe } from '@whyframe/core'
import { whyframeVue } from '@whyframe/vue'

export default defineConfig({
  title: 'VitePress + Whyframe',
  themeConfig: {
    footer: {
      message: 'VitePress + Whyframe'
    }
  },
  vite: {
    plugins: [
      inspect(),
      whyframe({
        defaultSrc: '/frames/default.html', // vitepress doesn't support whyframe default html
        components: [{ name: 'Story', showSource: true }]
      }),
      whyframeVue({
        include: /\.(?:vue|md)$/
      })
    ]
  }
})
