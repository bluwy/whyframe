---
title: VitePress
layout: ../../../layouts/DocsLayout.astro
---

# VitePress

[GitHub](https://github.com/vuejs/vitepress). [Website](https://vitepress.vuejs.org).

## Quick start

[Stackblitz demo](https://stackblitz.com/fork/github/bluwy/whyframe/tree/master/playground/vitepress).

## Scaffold your app

> If you have an existing VitePress app, you can skip this step.

You can create a new VitePress project following the [official guide](https://vitepress.vuejs.org/docs/getting-started).

`cd` into your project directory and install dependencies with `npm install`.

## Install

`whyframe` comes in two packages, the core library and the UI framework, in this case, Vue.

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
    whyframeVue({
      include: /\.(?:vue|md)$/ // also scan in markdown files
    })
  ]
})
```

As `whyframe`'s default HTML doesn't work in VitePress, a custom HTML source is required. See [HTML source](/docs/features#html-source) for more information.

To setup `/frames/default`, or in other words `http://localhost:5173/frames/default`, create an empty `/frames/default.md` file. Since we want to start from an empty layout, some VitePress configuration is required.

To not inherit [VitePress' special layouts](https://vitepress.vuejs.org/docs/theme-layout), we need to extend [VitePress' default theme](https://vitepress.vuejs.org/docs/theme-introduction#extending-the-default-theme). Create `.vitepress/theme/index.js` with this:

```js
import Theme from 'vitepress/theme'
import DynamicLayout from '../components/DynamicLayout.vue'

export default {
  ...Theme,
  // use our custom layout component that we'll create next
  Layout: DynamicLayout
}
```

Create `.vitepress/components/DynamicLayout.vue` with this:

```vue
<script setup>
import { useRoute } from 'vitepress'
import Theme from 'vitepress/theme'
// the default layout we'll create next
import FrameDefaultLayout from './FrameDefaultLayout.vue'

const route = useRoute()
</script>

<template>
  <!--
    replace with the layout entirely for `/frames/default`
    so we don't inherit from `Theme.Layout`
  -->
  <FrameDefaultLayout v-if="route.path.startsWith('/frames/default')" />
  <Theme.Layout v-else />
</template>
```

Create `.vitepress/components/FrameDefaultLayout.vue` with this:

```vue
<script setup>
import { ref, onMounted } from 'vue'
// Special api to mount the app
import { createApp } from 'whyframe:app'

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

And done! You can also add more code and styles to `FrameDefaultLayout.vue` if you prefer.

## Usage

In `index.md` (or any page), you can create an `iframe` like below:

<!-- prettier-ignore -->
```html
<iframe data-why>
  Hello world!
</iframe>
```

Start your app with `npm run dev` and watch `Hello world!` rendered within the `iframe` as-is!

Check out [Features](/docs/features) for more things you can do with `whyframe`.
