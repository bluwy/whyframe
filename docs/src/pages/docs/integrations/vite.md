---
title: Vite
layout: ../../../layouts/DocsLayout.astro
---

# Vite

[GitHub](https://github.com/vitejs/vite). [Website](https://vitejs.dev).

## Quick start

Stackblitz demo:

- [Svelte](https://stackblitz.com/fork/github/bluwy/whyframe/tree/master/playground/vite-svelte)
- [Vue](https://stackblitz.com/fork/github/bluwy/whyframe/tree/master/playground/vite-vue)
- [Solid](https://stackblitz.com/fork/github/bluwy/whyframe/tree/master/playground/vite-solid)
- [Preact](https://stackblitz.com/fork/github/bluwy/whyframe/tree/master/playground/vite-preact)
- [React](https://stackblitz.com/fork/github/bluwy/whyframe/tree/master/playground/vite-react)

## Scaffold your app

> If you have an existing Vite app, you can skip this step.

Create a new Vite project with:

```bash
$ npm create vite@latest
```

Choose any framework of choice to start. `whyframe` supports all UI frameworks except Lit.

`cd` into your project directory and install dependencies with `npm install`.

## Install

`whyframe` comes in two packages, the core library and the UI framework integration.

```bash
# Install the core library
$ npm install -D @whyframe/core

# Install the Svelte integration
$ npm install -D @whyframe/svelte

# Or install the Vue integration
$ npm install -D @whyframe/vue

# Or install the JSX integration (includes Solid, Preact & React)
$ npm install -D @whyframe/jsx
```

## Setup

`whyframe` works on the bundler level, so the packages are simply Vite plugins. You can initialize these plugins in your `vite.config.js`:

```js
import { defineConfig } from 'vite'
import { whyframe } from '@whyframe/core'
import { whyframeSvelte } from '@whyframe/svelte'
import { whyframeVue } from '@whyframe/vue'
import { whyframeJsx } from '@whyframe/jsx'

export default defineConfig({
  plugins: [
    // Initialize core plugin
    whyframe(),

    // Initialize Svelte integration plugin
    whyframeSvelte(),

    // Or initialize Vue integration plugin
    whyframeVue(),

    // Or initialize JSX integration plugin (also specify the UI framework)
    whyframeJSX({ defaultFramework: 'react' })
  ]
})
```

> The integration plugin must come before the UI framework plugin, e.g. `whyframeSvelte()` should come before the `svelte()` plugin, as `whyframe` needs to preprocess the raw framework code instead of the compiled code.

## Usage

Depending on which UI framework you're using, you can edit `App.svelte`, `App.vue`, or `App.jsx` to start creating an `iframe`. For example:

<!-- prettier-ignore -->
```html
<iframe data-why>
  Hello world!
</iframe>
```

Start your app with `npm run dev` and watch `Hello world!` rendered within the `iframe` as-is!

Check out [Features](/docs/features) for more things you can do with `whyframe`.
