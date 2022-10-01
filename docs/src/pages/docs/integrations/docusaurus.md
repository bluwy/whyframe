---
title: Docusaurus
layout: ../../../layouts/DocsLayout.astro
---

# Next

[GitHub](https://github.com/facebook/docusaurus). [Website](https://docusaurus.io).

Status: **Experimental**.

## Quick start

[Stackblitz demo](https://stackblitz.com/fork/github/bluwy/whyframe/tree/master/playground/docusaurus)

## Scaffold your app

> If you have an existing Docusaurus app, you can skip this step.

Create a new Docusaurus project with:

```bash
$ npx create-docusaurus@latest
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

`whyframe` works on the bundler level, so the packages are simply Webpack plugins and loaders. As Docusaurus only allow configuring the Webpack config through a Docusaurus plugin, `@whyframe/jsx/docusaurus` provides a handy plugin to do so:

```js
/** @type {import('@docusaurus/types').Config} */
const config = {
  plugins: [
    [
      '@whyframe/jsx/docusaurus',
      {
        defaultSrc: '/frames/default' // provide our own html
      }
    ]
  ]
}

module.exports = config
```

As `whyframe`'s default HTML doesn't work in Docusaurus, a custom HTML source is required. See [HTML source](/docs/features#html-source) for more information.

To setup `/frames/default`, or in other words `http://localhost:3000/frames/default`, create a `src/pages/frames/default/index.js` file:

```jsx
import { createApp } from 'whyframe:app'

export default function DefaultFrame() {
  return <div ref={(el) => createApp(el)}></div>
}
```

And done! You can also add more code and styles to `src/pages/frames/default/index.js` if you prefer.

## Usage

You can edit `src/pages/index.js` to start creating an `iframe`. For example:

<!-- prettier-ignore -->
```html
<iframe data-why>
  Hello world!
</iframe>
```

Start your app with `npm run dev` and watch `Hello world!` rendered within the `iframe` as-is!

Check out [Features](/docs/features) for more things you can do with `whyframe`.
