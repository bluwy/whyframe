---
title: Features
layout: ../../layouts/DocsLayout.astro
---

# Features

## Component isolation

`whyframe` allows you to develop components in isolation by simply wrapping it with an `iframe`.

`whyframe` works by extracting HTML within an `iframe` as a separate module. Non-HTML code like scripts and styles are also extracted as they may contain code used by the `iframe` content. See [How it works](/docs/how-it-works) for more details.

Due to it's naiveness, it may over extract scripts and styles that could cause compile-time or runtime warnings. And since the HTML surrounding the `iframe` is removed, scripts that reference them may throw an error.

To prevent this, make sure your code have proper null-handling when accessing potentially removed HTML elements. This may improve in the future with better preliminary dead-code elimination.

## Custom templates

By default, `@whyframe/core` provides a minimal HTML template used by an `iframe` to render the content. To change this, `@whyframe/core` has a `template` option to use a different template instead:

```js
export default defineConfig({
  plugins: [
    whyframe({
      template: {
        // path to access the template from the server
        default: '/frames/default',
        special: '/frames/special'
      }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        // use Vite's multi-page app (MPA) feature
        whyframeDefault: 'frames/basic/index.html',
        whyframeSpecial: 'frames/special/index.html',
        index: 'index.html'
      }
    }
  }
})
```

Then, you can specify which template to use with the `data-why-template` attribute.

<!-- prettier-ignore -->
```html
<iframe data-why>
  I am default
</iframe>

<iframe data-why data-why-template="special">
  I am special
</iframe>
```

## Abstracting components

Sometimes you have a specific style for an `iframe` that you'd like to abstract out as a component with your UI framework of choice. This can be handy if, for example, you're building a `<Story>` component, or a meta-framework using `whyframe`.

This is supported out of the box with two requirements:

1. The extracted `iframe` should only contain a `<slot />`, `{*.children}`, or `{children}`.

```html
<iframe data-why>
  <!-- tells whyframe to take special care of this -->
  <slot />
</iframe>
```

2. The component names need to be registered on the `components` option.

```js
export default defineConfig({
  plugins: [
    whyframe({
      // when whyframe sees a `<Story>` component, it knows that
      // it'll contain an `iframe` with a `<slot />`
      components: [{ name: 'Story' }]
    })
  ]
})
```

> Note: This is due to how module graphs are usually resolved top-down, as we compile components that uses `<Story>` first, before actually compiling the `Story` component.

With this, you can simply use the `<Story>` component anywhere you like!

<!-- prettier-ignore -->
```html
<Story>
  I will be in an iframe
</Story>
```
