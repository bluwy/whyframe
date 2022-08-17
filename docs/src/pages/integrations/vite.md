# Vite

All features are supported in Vite.

## Scaffold your app

> If you have an existing Vite app, you can skip this step.

Create a new Vite project with:

```bash
$ npm create vite@latest
```

Choose any framework of choice (except Lit) to start with! `whyframe` supports most UI frameworks out-of-the-box.

`cd` into your project directory and install dependencies with `npm install`.

## Install

`whyframe` comes in two packages, one for the core library and one for the UI framework.

<!-- TODO: make toggle for frameworks? -->

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

`whyframe` works at the bundler level, so the packages are Vite plugins. You can initialize these plugins in your `vite.config.js`:

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

    // Or initialize JSX integration plugin (also specify the UI framework used)
    whyframeJSX({ framework: 'solid' })
  ]
})
```

## Usage

Depending on which UI framework you're using, you can edit `App.svelte`, `App.vue`, or `App.jsx` to start creating an `iframe`. For example:

```html
<iframe data-why>
  <div>Test</div>
</iframe>
```

Start your app with `npm run dev` and watch `<div>Test</div>` rendered within the `iframe` as-is!

This is the basis of `whyframe`. It provides a low-level primitive to do one thing well. From here, you can style your iframe, add styles _within_ the iframe, author different iframe HTML templates, cross-interact with the iframe, and many more more!
