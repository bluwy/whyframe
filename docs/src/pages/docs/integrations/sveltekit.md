---
title: SvelteKit
layout: ../../../layouts/DocsLayout.astro
---

# SvelteKit

[GitHub](https://github.com/sveltejs/svelte). [Website](https://kit.svelte.dev).

## Quick start

[StackBlitz demo](https://stackblitz.com/fork/github/bluwy/whyframe/tree/master/playground/sveltekit).

## Scaffold your app

> If you have an existing SvelteKit app, you can skip this step.

Create a new SvelteKit project with:

```bash
$ npm create svelte@latest
```

`cd` into your project directory and install dependencies with `npm install`.

## Install

`whyframe` comes in two packages, the core library and the UI framework integration, in this case, Svelte.

```bash
# Install the core library
$ npm install -D @whyframe/core

# Install the Svelte integration
$ npm install -D @whyframe/svelte
```

## Setup

`whyframe` works on the bundler level, so the packages are simply Vite plugins. You can initialize these plugins in your `vite.config.js`:

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

In `src/routes/+page.svelte` (or any page), you can create an `iframe` like below:

<!-- prettier-ignore -->
```html
<iframe data-why>
  Hello world!
</iframe>
```

Start your app with `npm run dev` and watch `Hello world!` rendered within the `iframe` as-is!

Check out [Features](/docs/features) for more things you can do with `whyframe`.
