---
title: '@whyframe/jsx'
layout: ../../../layouts/DocsLayout.astro
---

# @whyframe/jsx

### include

- **Type:** `string | RegExp | (string | RegExp)[]`
- **Default:** `/\.[jt]sx$/`

A [picomatch pattern](https://github.com/micromatch/picomatch), or array of patterns, which specifies the files the plugin should operate on.

### exclude

- **Type:** `string | RegExp | (string | RegExp)[]`

A [picomatch pattern](https://github.com/micromatch/picomatch), or array of patterns, which specifies the files to be ignored by the plugin.

### framework

- **Type:** `'react' | 'preact' | 'solid'`

The UI framework for this integration. If not set, it try to fallback to the `jsxImportSource` option in `tsconfig.json`. This can be overridden per file with the `@jsxImportSource <framework>` comment at the top of the JSX file.

### parserOptions

- **Type:** [`ParserOptions`](https://babeljs.io/docs/en/babel-parser#options)

Custom parser options to be passed to `@babel/parser`.
