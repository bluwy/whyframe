export const appName = 'whyframe'

export const headerLinks = [
  { title: 'Guide', url: '/guide/getting-started' },
  { title: 'API', url: '/api' },
  { title: 'GitHub', url: 'https://github.com/bluwy/whyframe' }
]

export const sidebarGuideLinks = [
  {
    title: 'Introduction',
    children: [
      { title: 'Getting started', url: '/guide/getting-started' },
      { title: 'How it works', url: '/guide/how-it-works' }
    ]
  },
  {
    title: 'Integrations',
    children: [
      { title: 'Vite', url: '/integrations/vite' },
      { title: 'SvelteKit', url: '/integrations/sveltekit' },
      { title: 'Astro', url: '/integrations/astro' },
      { title: 'VitePress', url: '/integrations/vitepress' },
      { title: 'Nuxt', url: '/integrations/nuxt' }
    ]
  }
]
