export const appName = 'whyframe'
export const appDesc = 'Develop components in isolation with just an iframe'

export const githubRepoDocsUrl =
  'https://github.com/bluwy/whyframe/blob/master/docs/'

export const headerLinks = [
  { title: 'Docs', url: '/docs' },
  { title: 'Quick start', url: '/new', button: true },
  { title: 'GitHub', url: 'https://github.com/bluwy/whyframe' }
]

export const sidebarGuideLinks = [
  {
    title: 'Introduction',
    children: [
      { title: 'Overview', url: '/docs/overview' },
      { title: 'How it works', url: '/docs/how-it-works' },
      { title: 'Features', url: '/docs/features' }
    ]
  },
  {
    title: 'Integrations',
    children: [
      { title: 'Vite', url: '/docs/integrations/vite' },
      { title: 'Webpack', url: '/docs/integrations/webpack' },
      { title: 'SvelteKit', url: '/docs/integrations/sveltekit' },
      { title: 'Astro', url: '/docs/integrations/astro' },
      { title: 'VitePress', url: '/docs/integrations/vitepress' },
      { title: 'Nuxt', url: '/docs/integrations/nuxt' },
      { title: 'Next', url: '/docs/integrations/next' },
      { title: 'Docusaurus', url: '/docs/integrations/docusaurus' }
    ]
  },
  {
    title: 'Packages',
    children: [
      { title: '@whyframe/core', url: '/docs/packages/whyframe-core' },
      { title: '@whyframe/svelte', url: '/docs/packages/whyframe-svelte' },
      { title: '@whyframe/vue', url: '/docs/packages/whyframe-vue' },
      { title: '@whyframe/jsx', url: '/docs/packages/whyframe-jsx' },
      { title: '@whyframe/astro', url: '/docs/packages/whyframe-astro' }
    ]
  }
]

const guideLinks = sidebarGuideLinks.reduce((acc, { children }) => {
  return acc.concat(children)
}, [])

/**
 * @param {string} url
 */
export function getGuideAdjacentLink(url) {
  const index = guideLinks.findIndex(({ url: linkUrl }) => linkUrl === url)
  if (index === -1) {
    return null
  }
  const nextLink = guideLinks[index + 1]
  const prevLink = guideLinks[index - 1]
  return { nextLink, prevLink }
}
