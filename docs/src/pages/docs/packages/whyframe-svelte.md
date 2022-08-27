---
title: '@whyframe/svelte'
layout: ../../../layouts/DocsLayout.astro
---

# @whyframe/svelte

## Options

### include

- **Type:** `string | RegExp | (string | RegExp)[]`
- **Default:** `/\.svelte$/`

A [picomatch pattern](https://github.com/micromatch/picomatch), or array of patterns, which specifies the files the plugin should operate on.

### exclude

- **Type:** `string | RegExp | (string | RegExp)[]`

A [picomatch pattern](https://github.com/micromatch/picomatch), or array of patterns, which specifies the files to be ignored by the plugin.
