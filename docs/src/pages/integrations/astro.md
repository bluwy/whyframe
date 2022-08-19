---
title: Getting started
layout: ../../layouts/DocsLayout.astro
---

# Nuxt

All features are supported in Astro, except for the fallback `iframe` HTML feature, which will be covered in the [Setup](#setup) section.

## Scaffold your app

> If you have an existing Astro app, you can skip this step.

Create a new Astro project with:

```bash
$ npm create astro@latest
```

`cd` into your project directory and install dependencies with `npm install`.

## Install

`whyframe` comes in two packages, one for the core library and one for the framework, in this case, Astro.

```bash
# Install the core library
$ npm install -D @whyframe/core

# Install the Astro integration
$ npm install -D @whyframe/astro
```

Since `iframe`s are dynamic, you need a UI framework setup for Astro, e.g. [Svelte](https://docs.astro.build/en/guides/integrations-guide/svelte/), [Vue](https://docs.astro.build/en/guides/integrations-guide/vue/), [Solid](https://docs.astro.build/en/guides/integrations-guide/solid-js/), etc. This will render contents within the `iframe` as a Svelte component, for example.

Since Astro is also UI framework-agnostic, you can also install other integrations like `@whyframe/svelte` so it runs on Svelte files too! The difference between `@whyframe/astro` is that that `@whyframe/svelte` scans inside `.svelte` files, while `@whyframe/astro` scans `.astro` files only.

## Setup

`whyframe` works at the bundler level, so the packages are Vite plugins. You can initialize these plugins in your `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import { whyframe } from '@whyframe/core'
import { whyframeAstro } from '@whyframe/astro'

export default defineConfig({
  integrations: [svelte()],
  vite: {
    plugins: [
      // Initialize core plugin
      whyframe({
        template: {
          default: '/frames/default' // provide our own default template
        }
      }),

      // Initialize Vue integration plugin
      whyframeAstro({
        // Render `iframe` as Svelte components by default, can be changed via `data-why="vue"`
        defaultFramework: 'svelte'
      }),

      // Optional: Initialize Svelte integration plugin
      whyframeSvelte()
    ]
  }
})
```

To setup `/frames/default`, it simply represents a route, e.g. `http://localhost:5173/frames/default`, that `whyframe` will use. To create the route in Astro:

Create `src/pages/frames/default.astro`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>whyframe</title>
  </head>
  <body>
    <div id="app"></div>
    <script>
      import { createApp } from 'whyframe:app'

      createApp(document.getElementById('app'))
    </script>
  </body>
</html>
```

And done! You can add styles to `src/pages/frames/default.astro` to customize it where you see fit.

## Usage

In `src/pages/index.astro`, you can create an `iframe` like below:

```html
<iframe data-why>
  <div>Test</div>
</iframe>
```

Start your app with `npm run dev` and watch `<div>Test</div>` rendered within the `iframe` as-is!

> NOTE: The markup within the `iframe` must be strictly the UI framework syntax, e.g. in Vue:
>
> ```html
> <iframe data-why>
>   <div @click="something">Test</div>
> </iframe>
> ```

This is the basis of `whyframe`. It provides a low-level primitive to do one thing well. From here, you can style your iframe, add styles _within_ the iframe, author different iframe HTML templates, cross-interact with the iframe, and many more more!
