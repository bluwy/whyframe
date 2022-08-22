export const appName = 'whyframe'

export const githubRepoDocsUrl =
  'https://github.com/bluwy/whyframe/blob/master/docs/'

export const headerLinks = [
  { title: 'Docs', url: '/docs/getting-started' },
  { title: 'GitHub', url: 'https://github.com/bluwy/whyframe' }
]

export const sidebarGuideLinks = [
  {
    title: 'Introduction',
    children: [
      { title: 'Getting started', url: '/docs/getting-started' },
      { title: 'How it works', url: '/docs/how-it-works' }
    ]
  },
  {
    title: 'Integrations',
    children: [
      { title: 'Vite', url: '/docs/integrations/vite' },
      { title: 'SvelteKit', url: '/docs/integrations/sveltekit' },
      { title: 'Astro', url: '/docs/integrations/astro' },
      { title: 'VitePress', url: '/docs/integrations/vitepress' },
      { title: 'Nuxt', url: '/docs/integrations/nuxt' }
    ]
  }
]

const guideLinks = sidebarGuideLinks.reduce((acc, { children }) => {
  return acc.concat(children)
}, [])

export function getGuideAdjacentLink(url) {
  const index = guideLinks.findIndex(({ url: linkUrl }) => linkUrl === url)
  if (index === -1) {
    return null
  }
  const nextLink = guideLinks[index + 1]
  const prevLink = guideLinks[index - 1]
  return { nextLink, prevLink }
}
