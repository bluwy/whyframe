---
title: Features
layout: ../../layouts/DocsLayout.astro
---

# Features

## HTML extraction

`whyframe` works by extracting HTML within an `iframe` as a separate module. Non-HTML stuff like scripts and styles are also extracted as they may contain code used by the `iframe` content. See [How it works](/docs/how-it-works) for more details.

Due to it's naiveness, it may over extract scripts and styles that may cause compile-time or runtime warnings. And since HTML outside of the `iframe` is removed, scripts that references it may error.

To prevent this, make sure your code have proper null-handling when accessing potentially removed HTML elements. This may improve in the future with better preliminary dead-code elimination.

## Custom templates

By default, `@whyframe/core` provides a minimal HTML template used by an `iframe` to render the content. To change this, `@whyframe/core` has a `template` option to specify a custom template. Here's an example for Vite

```js
export default defineConfig({
  plugins: [
    whyframe({
      template: {
        // path to access the template from the server
        default: '/frames/default',
        special: '/frames/special'
      }
    }),
    vue()
  ],
  build: {
    rollupOptions: {
      input: {
        // use the multi-page app (MPA) feature
        whyframeBasic: 'frames/basic/index.html',
        whyframeSpecial: 'frames/special/index.html',
        index: 'index.html'
      }
    }
  }
})
```

Then, you can specify which template to use using the `data-why-template` attribute.

<!-- prettier-ignore -->
```html
<iframe data-why data-why-template="special">
  I feel special
</iframe>
```

## Custom components

While `iframe`s are handy, for advanced use-cases it may be useful to abstract if out as a component so we can share the UI around the `iframe`, think a `<Story>` component that accepts content similar to an `iframe`, but has extra story features.

`whyframe` allows this through configuration on the specific integration packages, which usually has the `components` option. For example, Svelte:

```js
export default defineConfig({
  plugins: [
    whyframe(),
    whyframeSvelte({
      components: [{ name: 'Story', path: './src/components/Story.svelte' }]
    }),
    svelte()
  ]
})
```

Whenever we're processing a Svelte component, we'd take special care for `<Story>` usages, which sets stores a different data internally to proxy over the actual file's `iframe`s.
