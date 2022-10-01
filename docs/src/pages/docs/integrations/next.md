---
title: Next.js
layout: ../../../layouts/DocsLayout.astro
---

# Next

[GitHub](https://github.com/vercel/next.js). [Website](https://nextjs.org).

Status: **Experimental**.

## Quick start

[Stackblitz demo](https://stackblitz.com/fork/github/bluwy/whyframe/tree/master/playground/next)

## Scaffold your app

> If you have an existing Next.js app, you can skip this step.

Create a new Next.js project with:

```bash
$ npx create-next-app@latest
```

`cd` into your project directory and install dependencies with `npm install`.

## Install

`whyframe` comes in two packages, the core library and the UI framework integration.

```bash
# Install the core library
$ npm install -D @whyframe/core

# Install the JSX integration
$ npm install -D @whyframe/jsx
```

## Setup

`whyframe` works on the bundler level, so the packages are simply Webpack plugins and loaders. You can initialize these plugins in your `next.config.js`:

```js
import { WhyframePlugin } from '@whyframe/core/webpack'

/** @type {import('next').NextConfig} */
export default {
  webpack(config) {
    config.plugins.unshift(
      new WhyframePlugin({
        defaultSrc: '/frames/default' // provide our own html
      })
    )
    config.module.rules.push({
      // Set `/\.jsx?$/` if you want to process .js files as .jsx
      test: /\.jsx$/,
      exclude: /node_modules/,
      use: [
        {
          loader: '@whyframe/jsx/loader',
          options: {
            defaultFramework: 'react'
          }
        }
      ]
    })
    return config
  }
}
```

As `whyframe`'s default HTML doesn't work in Next.js, a custom HTML source is required. See [HTML source](/docs/features#html-source) for more information.

To setup `/frames/default`, or in other words `http://localhost:3000/frames/default`, create a `src/pages/frames/default/index.jsx` file:

```jsx
import { createApp } from 'whyframe:app'

export default function DefaultFrame() {
  return <div ref={(el) => createApp(el)}></div>
}
```

And done! You can also add more code and styles to `src/pages/frames/default/index.js` if you prefer.

## Usage

You can edit `src/pages/index.jsx` to start creating an `iframe`. For example:

<!-- prettier-ignore -->
```html
<iframe data-why>
  Hello world!
</iframe>
```

Start your app with `npm run dev` and watch `Hello world!` rendered within the `iframe` as-is!

Check out [Features](/docs/features) for more things you can do with `whyframe`.
