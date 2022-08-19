---
title: Getting started
layout: ../../layouts/DocsLayout.astro
---

# Nuxt

All features are supported in Nuxt, except for the fallback `iframe` HTML feature, which will be covered in the [Setup](#setup) section.

## Scaffold your app

> If you have an existing Nuxt app, you can skip this step.

Create a new Nuxt project with:

```bash
$ npx nuxi init
```

`cd` into your project directory and install dependencies with `npm install`.

## Install

`whyframe` comes in two packages, one for the core library and one for the UI framework, in this case, Vue.

```bash
# Install the core library
$ npm install -D @whyframe/core

# Install the Vue integration
$ npm install -D @whyframe/vue
```

## Setup

`whyframe` works at the bundler level, so the packages are Vite plugins. You can initialize these plugins in your `vite.config.js`:

```js
import { defineConfig } from 'vite'
import { whyframe } from '@whyframe/core'
import { whyframeVue } from '@whyframe/vue'

export default defineConfig({
  plugins: [
    // Initialize core plugin
    whyframe({
      template: {
        default: '/frames/default' // provide our own default template
      }
    }),

    // Initialize Vue integration plugin
    whyframeVue()
  ]
})
```

<!-- TODO: this is a pain. @whyframe/nuxt ? -->

To setup `/frames/default`, it simply represents a route, e.g. `http://localhost:5173/frames/default`, that `whyframe` will use. To create the route in Nuxt, we need to use Nuxt's layout feature to colocate the files.

Update `app.vue` with:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

If you have an existing default Nuxt layout in the `layouts` folder, create a new `layouts/empty.vue` file so we have a new layout from sratch for the `iframe`:

```vue
<template>
  <slot />
</template>
```

We can then create a new route at `pages/frames/default.vue` with:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { createApp } from 'whyframe:app' // special api to mount the app

definePageMeta({
  layout: 'empty' // use the empty layout
})

const el = ref()

onMounted(() => {
  createApp(el.value) // mount the app to the ref
})
</script>

<template>
  <div ref="el"></div>
</template>
```

And done! You can add styles to `pages/frames/default.vue` to customize it where you see fit.

## Usage

In `src/routes/+page.svelte`, you can create an `iframe` like below:

```html
<iframe data-why>
  <div>Test</div>
</iframe>
```

Start your app with `npm run dev` and watch `<div>Test</div>` rendered within the `iframe` as-is!

This is the basis of `whyframe`. It provides a low-level primitive to do one thing well. From here, you can style your iframe, add styles _within_ the iframe, author different iframe HTML templates, cross-interact with the iframe, and many more more!
