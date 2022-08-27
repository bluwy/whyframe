---
title: Getting started
layout: ../../layouts/DocsLayout.astro
---

# Getting started

## What is whyframe?

`whyframe` allows seamless rendering of HTML within `iframe`s. For example:

<!-- prettier-ignore -->
```html
<iframe data-why>
  Hello world!
</iframe>
```

`"Hello world!"` will be rendered within the `iframe` as it should! Without `whyframe`, browsers would usually just render a blank `iframe`.

## How does it work?

`whyframe` relies on JavaScript bundlers to apply HTML extraction within the `iframe`s. Check out [How it works](/docs/how-it-works) for an in-depth explanation!

## Project status

Experimental. Works well for Svelte and Vue. Improvements needed for JSX libraries, e.g Solid, Preact, and React. The API may also change during the `v0.x` period. See the [1.0 Roadmap](https://github.com/bluwy/whyframe/discussions/1) for the full details.

## Manual setup

`whyframe` requires a JavaScript bundler to work. Currently, only Vite is supported, which powers major meta-frameworks such as SvelteKit, Astro, VitePress, and Nuxt.

Check out the integration guides below to get started!

- [Vite](/docs/integrations/vite)
- [SvelteKit](/docs/integrations/sveltekit)
- [Astro](/docs/integrations/astro)
- [VitePress](/docs/integrations/vitepress)
- [Nuxt](/docs/integrations/nuxt)
