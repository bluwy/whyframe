---
title: '@whyframe/astro'
layout: ../../../layouts/DocsLayout.astro
---

# @whyframe/astro

### include

- **Type:** `string | RegExp | (string | RegExp)[]`
- **Default:** `/\.astro$/`

A [picomatch pattern](https://github.com/micromatch/picomatch), or array of patterns, which specifies the files the plugin should operate on.

### exclude

- **Type:** `string | RegExp | (string | RegExp)[]`

A [picomatch pattern](https://github.com/micromatch/picomatch), or array of patterns, which specifies the files to be ignored by the plugin.

### defaultFramework

- **Type:** `'svelte' | 'vue' | 'solid' | 'preact' | 'react'`

All `iframe`s require a value for `data-why` to render the HTML content using a specific UI framework. If unset, it can fallback to this value.
