---
title: Getting started
layout: ../../layouts/DocsLayout.astro
---

# How it works

## Simple explanation

The gist of its secret sauce is that `whyframe` extracts out the code within the `iframe`, which is processed as a separate module by the bundler, and the `iframe` would then load an HTML with a custom script that loads that separate module as a new entrypoint.

## Detailed explanation

To be specific, `iframe` extraction is done per UI framework, e.g. Svelte, Vue, JSX, using their own respective parsers. Besides the code within the `iframe`, additional side-effects like styles, imports, state, needs to be extracted as well so that variable references aren't lost.

Once we have the extracted code, we create a virtual module (a module that only exists in memory) that acts like a mini app. Another small virtual module is then created to import and initialize the mini app, which contains code similar to how you initialize your app in your app entrypoint. We get its virtual id (a unique identifier for the module) and pass it as an attribute of the `iframe` to be retrieved later.

Within the `iframe` HTML, `whyframe:app` is a custom script that's used to read the virtual id we passed, which will load the virtual module and initialize it. And that's all!

## Background

When I was building a Storybook alternative, component isolation has been an annoying problem to solve that had be stumped for weeks. Some of the ideas were:

1. Manual runtime isolation and separation

Problem: It doesn't work for every framework. The code output is only transferred and rendered into the iframe, interactions within the iframe are limited. Does not handle transferring styles well.

2. Web components and the shadow DOM

Problem: The shadow DOM doesn't reduce complexity compared to an iframe. All caveats are transferred over, except style isolation, but it's still not perfect.

3. Proprietary syntax to enforce simpler extraction

Problem: Storybook calls this "Component Story Format" and it is non-ergonomic. It only works with JSX in mind, with other templating libraries not working well. Users shouldn't learn a new syntax too.

After all these explorations, a feature in Svelte VSCode caught my interest -- the `Svelte: Extract component` command. Basically, when you highlight a specific markup, the command will then extract the markup as a separate Svelte component, and brings along `<script>` and `<style>` too.

Now `whyframe` works on the same premise, except expanding for a different purpose.
