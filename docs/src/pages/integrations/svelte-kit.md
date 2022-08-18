# SvelteKit

All features are supported in SvelteKit.

## Scaffold your app

> If you have an existing SvelteKit app, you can skip this step.

Create a new SvelteKit project with:

```bash
$ npm create svelte@latest
```

`cd` into your project directory and install dependencies with `npm install`.

## Install

`whyframe` comes in two packages, one for the core library and one for the UI framework, in this case, Svelte.

```bash
# Install the core library
$ npm install -D @whyframe/core

# Install the Svelte integration
$ npm install -D @whyframe/svelte
```

## Setup

`whyframe` works at the bundler level, so the packages are Vite plugins. You can initialize these plugins in your `vite.config.js`:

```js
import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { whyframe } from '@whyframe/core'
import { whyframeSvelte } from '@whyframe/svelte'

export default defineConfig({
  plugins: [
    sveltekit(),

    // Initialize core plugin
    whyframe(),

    // Initialize Svelte integration plugin
    whyframeSvelte()
  ]
})
```

## Usage

In `src/routes/+page.svelte`, you can create an `iframe` like below:

```html
<iframe data-why>
  <div>Test</div>
</iframe>
```

Start your app with `npm run dev` and watch `<div>Test</div>` rendered within the `iframe` as-is!

This is the basis of `whyframe`. It provides a low-level primitive to do one thing well. From here, you can style your iframe, add styles _within_ the iframe, author different iframe HTML templates, cross-interact with the iframe, and many more more!
