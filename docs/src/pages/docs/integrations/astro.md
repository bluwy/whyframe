---
title: Astro
layout: ../../../layouts/DocsLayout.astro
---

# Astro

[GitHub](https://github.com/withastro/astro). [Website](https://astro.build).

Status: **Experimental**.

## Quick start

[StackBlitz demo](/new/astro).

## Scaffold your app

> If you have an existing Astro app, you can skip this step.

Create a new Astro project with:

```bash
$ npm create astro@latest
```

`cd` into your project directory and install dependencies with `npm install`.

## Install

`whyframe` comes in two packages,bthe core library and the framework integration, in this case, Astro.

```bash
# Install the core library
$ npm install -D @whyframe/core

# Install the Astro integration
$ npm install -D @whyframe/astro
```

Since `iframe`s are dynamic, you need a UI framework setup for Astro, e.g. [Svelte](https://docs.astro.build/en/guides/integrations-guide/svelte/), [Vue](https://docs.astro.build/en/guides/integrations-guide/vue/), [Solid](https://docs.astro.build/en/guides/integrations-guide/solid-js/), etc. This will render HTML within the `iframe` using the framework.

Since Astro is also UI framework-agnostic, you can also install other integrations like `@whyframe/svelte` so it runs on Svelte files too! The difference between it and `@whyframe/astro` is that `@whyframe/svelte` scans `.svelte` files only, and `@whyframe/astro` scans `.astro` files only.

## Setup

`whyframe` works on the bundler level, so the packages are simply Vite plugins. You can initialize these plugins in your `astro.config.mjs`:

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
        defaultSrc: '/frames/default' // provide our own html
      }),

      // Initialize Astro integration plugin
      whyframeAstro({
        // Render `iframe`s as Svelte components by default,
        // can be changed via `data-why="vue"`
        defaultFramework: 'svelte'
      })
    ]
  }
})
```

As `whyframe`'s default HTML doesn't work in Astro, a custom HTML source is required. See [HTML source](/docs/features#html-source) for more information.

To setup `/frames/default`, or in other words `http://localhost:3000/frames/default`, create a `src/pages/frames/default.astro` file:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>whyframe</title>
  </head>
  <body>
    <div id="app"></div>
    <script>
      // Special api to mount the app
      import { createApp } from 'whyframe:app'
      // Mount the app to `<div id="app"></div>`
      createApp(document.getElementById('app'))
    </script>
  </body>
</html>
```

And done! You can also add more code and styles to `src/pages/frames/default.astro` if you prefer.

## Usage

In `src/pages/index.astro` (or any other page), you can create an `iframe` like below:

<!-- prettier-ignore -->
```html
<iframe data-why>
  Hello world!
</iframe>
```

Also, make sure the HTML inside the `iframe` is strictly the UI framework syntax. This is because Astro code is exclusively server-side and can't be rendered dynamically in the browser. For example, if using Vue:

```html
<iframe data-why="vue">
  <p @click="something">Hello world!</p>
</iframe>
```

Start your app with `npm run dev` and watch `Hello world!` rendered within the `iframe` as-is!

Check out [Features](/docs/features) for more things you can do with `whyframe`.
