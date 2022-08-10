import path from 'node:path'
import { createFilter } from 'vite'
import { parse } from '@astrojs/compiler'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'

const knownFrameworks = ['svelte', 'vue', 'solid', 'preact', 'react']

/**
 * @type {import('.').whyframeAstro}
 */
export function whyframeAstro(options) {
  /** @type {import('@whyframe/core').Api} */
  let api

  const filter = createFilter(options?.include || /\.astro$/, options?.exclude)

  /** @type {import('vite').Plugin} */
  const plugin = {
    name: 'whyframe:astro',
    enforce: 'pre',
    configResolved(c) {
      api = c.plugins.find((p) => p.name === 'whyframe:api')?.api
      if (!api) {
        // TODO: maybe fail safe
        throw new Error('whyframe() plugin is not installed')
      }

      // run our plugin before astro's
      const astro = c.plugins.findIndex((p) => p.name === 'astro:build')
      if (astro !== -1) {
        const myIndex = c.plugins.findIndex((p) => p.name === 'whyframe:astro')
        if (myIndex !== -1) {
          c.plugins.splice(myIndex, 1)
          c.plugins.splice(astro, 0, plugin)
          delete plugin.enforce
        }
      }
    },
    async transform(code, id) {
      if (!filter(id) || id.includes('__whyframe-')) return
      if (!code.includes('<iframe')) return

      // parse instances of `<iframe data-why></iframe>` and extract them out as a virtual import
      const s = new MagicString(code)

      const ast = (await parse(code, { position: true })).ast

      // collect code needed for virtual imports, assume all these have side effects
      let frontmatterCode =
        ast.children[0]?.type === 'frontmatter' ? ast.children[0].value : ''

      // generate initial hash
      const baseHash = api.getHash(frontmatterCode)

      // shim Astro global
      frontmatterCode = shimAstro + '\n\n' + frontmatterCode

      walk(ast, {
        enter(node) {
          if (
            node.type === 'element' &&
            node.name === 'iframe' &&
            node.attributes.find((a) => a.name === 'data-why') &&
            node.children.length > 0
          ) {
            // .astro requires a value for data-why to render as a specific framework
            /** @type {import('.').Options['defaultFramework']} */
            const framework =
              node.attributes.find((a) => a.name === 'data-why').value ||
              options?.defaultFramework

            if (!framework) {
              // TODO: generate frame
              console.warn(
                `<iframe data-why> in .astro files must specify a value for data-why, e.g. <iframe data-why="svelte">. ` +
                  `Supported frameworks include ${knownFrameworks
                    .map((f) => `"${f}"`)
                    .join(', ')}.`
              )
              return
            }
            if (!knownFrameworks.includes(framework)) {
              // TODO: generate frame
              console.warn(
                `<iframe data-why="${framework}"> isn't supported. ` +
                  `Supported frameworks include ${knownFrameworks
                    .map((f) => `"${f}"`)
                    .join(', ')}.`
              )
              return
            }

            // extract iframe html
            const iframeContentStart = node.children[0].position.start.offset
            const iframeContentEnd = node.position.end.offset - `</`.length // astro position ends until </
            const iframeContent = code.slice(
              iframeContentStart,
              iframeContentEnd
            )
            s.remove(iframeContentStart, iframeContentEnd)

            // derive final hash per iframe
            const finalHash = api.getHash(baseHash + iframeContent)

            const entryComponentId = api.createEntryComponent(
              id,
              finalHash,
              framework === 'svelte'
                ? '.svelte'
                : framework === 'vue'
                ? '.vue'
                : path.extname(id),
              createEntryComponent(frontmatterCode, iframeContent, framework)
            )

            const entryId = api.createEntry(
              id,
              finalHash,
              getEntryExtension(framework),
              createEntry(entryComponentId, framework)
            )

            // inject template props
            const templateName = node.attributes.find(
              (a) => a.name === 'data-why-template'
            )?.value
            const iframeAttrs = api.getIframeAttrs(
              entryId,
              finalHash,
              templateName
            )
            s.appendLeft(
              node.position.start.offset + `<iframe`.length,
              iframeAttrs
            )
          }
        }
      })

      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: s.generateMap({ hires: true })
        }
      }
    }
  }

  return plugin
}

function getEntryExtension(framework) {
  switch (framework) {
    case 'svelte':
    case 'vue':
      return '.js'
    case 'solid':
    case 'preact':
    case 'react':
      return '.jsx'
  }
}

/**
 * @param {string} entryId
 * @param {import('.').Options['defaultFramework']} framework
 */
function createEntry(entryId, framework) {
  switch (framework) {
    case 'svelte':
      return `\
import App from '${entryId}'

export function createApp(el) {
  new App({ target: el })
}`
    case 'vue':
      return `\
import { createApp as _createApp } from 'vue'
import App from '${entryId}'

export function createApp(el) {
  _createApp(App).mount(el)
}`
    case 'react':
      return `\
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WhyframeApp } from '${entryId}'

export function createApp(el) {
  ReactDOM.createRoot(el).render(<WhyframeApp />)
}`
    case 'preact':
      return `\
import { render } from 'preact'
import { WhyframeApp } from '${entryId}'

export function createApp(el) {
  render(<WhyframeApp />, el)
}`
    case 'solid':
      return `\
import { render } from 'solid-js/web'
import { WhyframeApp } from '${entryId}'

export function createApp(el) {
  render(() => <WhyframeApp />, el)
}`
  }
}

/**
 * @param {string} contextCode
 * @param {string} iframeHtmlCode
 * @param {import('.').Options['defaultFramework']} framework
 */
function createEntryComponent(contextCode, iframeHtmlCode, framework) {
  switch (framework) {
    case 'svelte':
      return `\
<script>
    ${contextCode}
</script>

${iframeHtmlCode}`
    case 'vue':
      return `\
<script setup>
  ${contextCode}
</script>

<template>
  ${iframeHtmlCode}
</template>`
    case 'solid':
    case 'preact':
    case 'react':
      const source = framework === 'solid' ? 'solid-js' : framework
      return `\
/** @jsxImportSource ${source} */

${contextCode}

export function WhyframeApp() {
  return (
    <>
      ${iframeHtmlCode}
    </>
  )
}`
  }
}

// TODO: dont be lazy
const shimAstro = `\
const Astro = {
  site: undefined,
  generator: 'whyframe',
  glob: () => [],
  resolve: (s) => s
}`
