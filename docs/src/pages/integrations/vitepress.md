# VitePress

All features are supported in VitePress, except for the fallback `iframe` HTML feature, which will be covered in the [Setup](#setup) section.

## Scaffold your app

> If you have an existing VitePress app, you can skip this step.

You can create a new VitePress project following the [official guide](https://vitepress.vuejs.org/guide/getting-started).

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
    whyframeVue({
      include: /\.(?:vue|md)$/ // also scan in markdown files
    })
  ]
})
```

<!-- TODO: this is a pain. @whyframe/vitepress ? -->

To setup `/frames/default`, it simply represents a route, e.g. `http://localhost:5173/frames/default`, that `whyframe` will use. To create the route in VitePress, an empty `/frames/default.md` file can be created.

To let `whyframe` know how to mount the code within the `iframe`, we need to extend [VitePress' default theme](https://vitepress.vuejs.org/guide/theme-introduction#extending-the-default-theme). The goal is to apply our custom theme layout from scratch to not inherit [VitePress' special layouts](https://vitepress.vuejs.org/guide/theme-layout). Buckle up!

Create `.vitepress/theme/index.js` with this:

```js
import Theme from 'vitepress/theme'
import DynamicLayout from '../components/DynamicLayout.vue'

export default {
  ...Theme,
  Layout: DynamicLayout // replace with our custom layout component we will create next
}
```

Create `.vitepress/components/DynamicLayout.vue` with this:

```vue
<script setup>
import { useRoute } from 'vitepress'
import Theme from 'vitepress/theme'
import FrameDefaultLayout from './FrameDefaultLayout.vue' // the default layout we will create next

const route = useRoute()
</script>

<template>
  <!-- replace with the layout entirely for `/frame/default` so we don't inherit from `Theme.Layout` -->
  <FrameDefaultLayout v-if="route.path.startsWith('/frames/default')" />
  <Theme.Layout v-else />
</template>
```

Create `.vitepress/components/FrameDefaultLayout.vue` with this:

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { createApp } from 'whyframe:app' // special api to mount the app

const el = ref()

onMounted(() => {
  createApp(el.value) // mount the app to the ref
})
</script>

<template>
  <div ref="el"></div>
</template>
```

And done! You can add styles to `FrameDefaultLayout.vue` to customize it where you see fit.

## Usage

In `src/routes/+page.svelte`, you can create an `iframe` like below:

```html
<iframe data-why>
  <div>Test</div>
</iframe>
```

Start your app with `npm run dev` and watch `<div>Test</div>` rendered within the `iframe` as-is!

This is the basis of `whyframe`. It provides a low-level primitive to do one thing well. From here, you can style your iframe, add styles _within_ the iframe, author different iframe HTML templates, cross-interact with the iframe, and many more more!
