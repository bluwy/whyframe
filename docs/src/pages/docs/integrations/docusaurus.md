---
title: Docusaurus
layout: ../../../layouts/DocsLayout.astro
---

# Docusaurus

[GitHub](https://github.com/facebook/docusaurus). [Website](https://docusaurus.io).

Status: **Experimental**.

## Quick start

[StackBlitz demo](/new/docusaurus)

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
  plugins: ['@whyframe/jsx/docusaurus']
}

module.exports = config
```

> In some cases, you may need to run the `docusaurus clear` command for the changes to take effect.

## Usage

You can edit `src/pages/index.js` to start creating an `iframe`. For example:

<!-- prettier-ignore -->
```html
<iframe data-why>
  Hello world!
</iframe>
```

Start your app with `npm run dev` and watch `Hello world!` rendered within the `iframe` as-is!

To customize the default `iframe` content, the [StackBlitz demo](/new/docusaurus) has an example of setting up a `/frames/basic` page.

Check out [Features](/docs/features) for more things you can do with `whyframe`.
