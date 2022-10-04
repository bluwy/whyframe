import path from 'node:path'
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import svelte from '@astrojs/svelte'
import vue from '@astrojs/vue'
import solid from '@astrojs/solid-js'
import preact from '@astrojs/preact'
import react from '@astrojs/react'
import inspect from 'vite-plugin-inspect'
import { cloudflareRedirect } from 'vite-plugin-cloudflare-redirect'
import { whyframe } from '@whyframe/core'
import { whyframeAstro } from '@whyframe/astro'
import { whyframeSvelte } from '@whyframe/svelte'
import { whyframeVue } from '@whyframe/vue'
import { whyframeJsx } from '@whyframe/jsx'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export default defineConfig({
  site: 'https://whyframe.dev',
  build: {
    format: 'file'
  },
  integrations: [
    mdx(),
    svelte({
      onwarn: (warning, handler) => {
        if (warning.code === 'css-unused-selector') return
        if (warning.filename?.includes('HeroDemo.svelte')) return
        handler(warning)
      }
    }),
    vue(),
    solid(),
    preact(),
    react()
  ],
  vite: {
    plugins: [
      cloudflareRedirect(),
      inspect(),
      whyframe({
        defaultSrc: '/frames/default'
      }),
      whyframeAstro({
        defaultFramework: 'svelte'
      }),
      whyframeSvelte(),
      whyframeVue(),
      whyframeJsx()
    ],
    resolve: {
      alias: {
        '@': path.resolve('./src')
      }
    }
  },
  markdown: {
    extendDefaultPlugins: true,
    rehypePlugins: [
      rehypeSlug, // NOTE: this is required for autolink-headings for .md files only
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          test: ['h2', 'h3'],
          properties: {
            ariaHidden: 'true',
            tabIndex: -1,
            className: 'anchor'
          },
          content: {
            type: 'element',
            tagName: 'svg',
            properties: {
              width: '24',
              height: '24',
              fill: 'currentColor'
            },
            children: [
              {
                type: 'element',
                tagName: 'use',
                properties: {
                  href: '#autolink-icon' // Symbol defined in Icons.svelte
                }
              }
            ]
          }
        }
      ]
    ]
  }
})
