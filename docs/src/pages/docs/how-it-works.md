---
title: Getting started
layout: ../../layouts/DocsLayout.astro
---

# How it works

## Simple explanation

`whyframe` extracts out the HTML within `iframe`s, which is processed as a separate module by the bundler, and the `iframe` would then load a different HTML with a custom script that loads that separate module as a new entrypoint.

## Detailed explanation

`iframe` extraction is done per UI framework, e.g. Svelte, Vue, JSX, using their own respective parsers. Besides extracting the HTML within `iframe`s, additional side-effects like scripts, styles, imports, and state, needs to be extracted as well so context and variable references aren't lost.

Once all are extracted and combined, we create a virtual module (a module that only exists in memory) that acts as a mini app. Another small virtual module is then created to import and initialize the mini app, which contains code similar to how you initialize your app in your app entrypoint. We get its virtual id (a unique identifier for the module) and pass it as an attribute of the `iframe` to be retrieved later.

Within the `iframe` HTML, `whyframe:app` is a custom script that's used to read the virtual id passed, which it will load the virtual module, initialize it, and render the app. So now the extracted HTML is displayed within the `iframe`.

## Background

When I was building a Storybook alternative, component isolation has been a frustrating problem to solve that had me stumped for weeks. Some of the ideas were:

### 1. Manual runtime isolation and separation

Ideally we can create a framework-specific `iframe` wrapper component, that teleports our HTML into the `iframe`. However, this does not work for every framework. The code output is only transferred and rendered into the iframe, interactions within the iframe are limited. It does not handle styles well.

### 2. Web components and the shadow DOM

Instead of `iframe`s, web components could do the trick too, as so I thought. Alas all caveats above also apply here, except style isolation, but it's still not perfect.

### 3. Proprietary syntax to enforce simpler extraction

A popular example of this is the ["Component Story Format"](https://github.com/ComponentDriven/csf), but it's another syntax to learn, not very flexible, and mainly works with JSX where other templating libraries are a second thought.

### 4. HTML extraction with tight bundler integration

At last, a feature in Svelte VSCode caught my interest -- the `Svelte: Extract Component` command. It works by extracting the highlighted markup as a Svelte component in a new file, which also brings along the `<script>` and `<style>` too.

And since runtime isn't the solution , compile-time would fit nicely here. With that idea, comes `whyframe`, which automates all of it under-the-hood.
