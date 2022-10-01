---
title: Nuxt
layout: ../../../layouts/DocsLayout.astro
---

# Nuxt

[GitHub](https://github.com/nuxt/framework). [Website](https://v3.nuxtjs.org).

## Quick start

[StackBlitz demo](https://stackblitz.com/fork/github/bluwy/whyframe/tree/master/playground/nuxt).

## Scaffold your app

> If you have an existing Nuxt app, you can skip this step.

Create a new Nuxt project with:

```bash
$ npx nuxi init
```

`cd` into your project directory and install dependencies with `npm install`.

## Install

`whyframe` comes in two packages, the core library and the UI framework integration, in this case, Vue.

```bash
# Install the core library
$ npm install -D @whyframe/core

# Install the Vue integration
$ npm install -D @whyframe/vue
```

## Setup

`whyframe` works on the bundler level, so the packages are simply Vite plugins. You can initialize these plugins in your `vite.config.js`:

```js
import { defineConfig } from 'vite'
import { whyframe } from '@whyframe/core'
import { whyframeVue } from '@whyframe/vue'

export default defineConfig({
  plugins: [
    // Initialize core plugin
    whyframe({
      defaultSrc: '/frames/default' // provide our own html
    }),

    // Initialize Vue integration plugin
    whyframeVue()
  ]
})
```

To setup `/frames/default`, or in other words `http://localhost:3000/frames/default`, we need to use Nuxt's layout feature. Update `app.vue` with:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

Create a new `layouts/empty.vue` file so we have a new layout from sratch for the `iframe`:

```vue
<template>
  <slot />
</template>
```

We can then create a new route at `pages/frames/default.vue` with:

```vue
<script setup>
import { ref, onMounted } from 'vue'
// Special api to mount the app
import { createApp } from 'whyframe:app'

// Use the empty layout
definePageMeta({ layout: 'empty' })

const el = ref()

onMounted(() => {
  // Mount the app to the ref
  createApp(el.value)
})
</script>

<template>
  <div ref="el"></div>
</template>
```

And done! You can also add more code and styles to `pages/frames/default.vue` if you prefer.

## Usage

In `src/pages/index.vue` (or any other page), you can create an `iframe` like below:

<!-- prettier-ignore -->
```html
<iframe data-why>
  Hello world!
</iframe>
```

Start your app with `npm run dev` and watch `Hello world!` rendered within the `iframe` as-is!

Check out [Features](/docs/features) for more things you can do with `whyframe`.
