---
title: Webpack
layout: ../../../layouts/DocsLayout.astro
---

# Webpack

[GitHub](https://github.com/webpack/webpack). [Website](https://webpack.js.org).

Status: **Experimental**.

## Quick start

StackBlitz demo:

- [React](/new/webpack-react)

> Only React is officially tested as other UI frameworks don't actively support Webpack anymore.

> This guide does not cover [create-react-app](https://create-react-app.dev) as it requires modifying the webpack configuration, which can only be achieved by ejecting or with [react-app-rewired](https://github.com/timarney/react-app-rewired). It is still possible that `whyframe` works with it following the same configuration steps below.

## Scaffold your app

> If you have an existing Webpack app, you can skip this step.

The easiest way to scaffold a vanilla Webpack app is to use the [Stackblitz React demo](/new/webpack-react) above, which already has `whyframe` setup. You can still read below to learn the configuration steps.

## Install

`whyframe` comes in two packages, the core library and the UI framework integration.

```bash
# Install the core library
$ npm install -D @whyframe/core

# Install the JSX integration
$ npm install -D @whyframe/jsx
```

## Setup

`whyframe` works on the bundler level, so the packages are simply Webpack plugins and loaders. You can initialize these plugins in your `webpack.config.js`:

```js
const { WhyframePlugin } = require('@whyframe/core/webpack')

module.exports = {
  plugins: [
    // Initialize core plugin
    new WhyframePlugin({
      defaultSrc: '/frames/default' // provide our own html
    })
  ],
  module: {
    rules: [
      // Make sure to add this rule after babel-loader
      {
        // Set `/\.[jt]sx?$/` if you want to process .js files as .jsx
        test: /\.[jt]sx$/,
        exclude: /node_modules/,
        use: [
          {
            // Initialize JSX loader
            loader: '@whyframe/jsx/loader',
            options: {
              defaultFramework: 'react'
            }
          }
        ]
      }
    ]
  }
}
```

As `whyframe`'s default HTML doesn't work in Webpack, a custom HTML source is required. See [HTML source](/docs/features#html-source) for more information.

To setup `/frames/default`, or in other words `http://localhost:8080/frames/default`, create a `/frames/default/main.js` file:

```js
import { createApp } from 'whyframe:app'
createApp(document.getElementById('app'))
```

And add a `/frames/default/index.html` file with any HTML you'd like. To build the HTML page, [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) is required. Install it with:

```bash
$ npm install -D html-webpack-plugin
```

And initialize it in your `webpack.config.js`:

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'frames/default/index.html',
      template: './frames/default/index.html',
      chunks: ['frameDefaultIndex']
    })
  ]
}
```

And done! You can also add more code and styles to `/frames/default/` if you prefer.

## Usage

You can edit `App.jsx` to start creating an `iframe`. For example:

<!-- prettier-ignore -->
```html
<iframe data-why>
  Hello world!
</iframe>
```

Start your app with `npm run dev` and watch `Hello world!` rendered within the `iframe` as-is!

Check out [Features](/docs/features) for more things you can do with `whyframe`.
