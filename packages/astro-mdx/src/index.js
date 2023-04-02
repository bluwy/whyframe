import { builtinModules } from 'node:module'
import { createFilter } from 'vite'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { dedent, hash } from '@whyframe/core/pluginutils'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { mdxFromMarkdown } from 'mdast-util-mdx'
import { mdxjs } from 'micromark-extension-mdxjs'

const knownFrameworks = ['svelte', 'vue', 'solid', 'preact', 'react']

const knownNodeImports = ['astro/components']

// credit: Vite
const importsRE =
  /(?<!\/\/.*)(?<=^|;|\*\/)\s*import(?!\s+type)([\w*{}\n\r\t, ]+)from\s*\s*("[^"]+"|'[^']+')\s*(?=$|;|\/\/|\/\*)/gm

/**
 * @type {import('..').whyframeAstroMdx}
 */
export function whyframeAstroMdx(options) {
  /** @type {import('@whyframe/core').Api} */
  let api

  const filter = createFilter(options?.include || /\.mdx$/, options?.exclude)

  /** @type {import('vite').Plugin} */
  const plugin = {
    name: 'whyframe:astro-mdx',
    enforce: 'pre',
    configResolved(c) {
      api = c.plugins.find((p) => p.name === 'whyframe:api')?.api
      if (!api) {
        // TODO: maybe fail safe
        throw new Error('whyframe() plugin is not installed')
      }

      // run our plugin before astro's
      const astroMdx = c.plugins.findIndex((p) => p.name === '@mdx-js/rollup')
      if (astroMdx !== -1) {
        const myIndex = c.plugins.findIndex(
          (p) => p.name === 'whyframe:astro-mdx'
        )
        if (myIndex !== -1) {
          // @ts-ignore-error hack
          c.plugins.splice(myIndex, 1)
          // @ts-ignore-error hack
          c.plugins.splice(astroMdx, 0, plugin)
          delete plugin.enforce
        }
      }
    },
    async transform(code, id) {
      if (!filter(id)) return
      if (!api.moduleMayHaveIframe(id, code)) return

      // parse instances of `<iframe data-why></iframe>` and extract them out as a virtual import
      const s = new MagicString(code)

      const ast = fromMarkdown(code, {
        extensions: [mdxjs()],
        mdastExtensions: [mdxFromMarkdown()]
      })

      // collect code needed for virtual imports, assume all these have side effects
      let mdxEsmCode = ''
      for (const node of ast.children) {
        if (node.type === 'mdxjsEsm') {
          let esmCode = node.value
          if (esmCode.startsWith('export ')) {
            esmCode = esmCode.slice(7)
          }
          mdxEsmCode += esmCode
        }
      }

      // we're transferring frontmatter code to framework code (node => browser).
      // so remove potential node imports that may break
      if (mdxEsmCode) {
        mdxEsmCode = mdxEsmCode.replace(importsRE, (ori, m1, m2) => {
          /** @type {string} */
          const importSpecifier = m2.slice(1, -1)
          if (
            importSpecifier.endsWith('.astro') ||
            importSpecifier.startsWith('node:') ||
            builtinModules.includes(importSpecifier) ||
            knownNodeImports.includes(importSpecifier)
          ) {
            return ''
          } else {
            return ori
          }
        })
      }

      // @ts-expect-error ast can be passed here
      walk(ast, {
        enter(/** @type {any} */ node) {
          const isIframeElement =
            node.type === 'mdxJsxFlowElement' &&
            node.name === 'iframe' &&
            node.attributes.some((a) => a.name === 'data-why')

          // NOTE: proxy iframe does not apply to MDX files

          const iframeComponent =
            node.type === 'component' && api.getComponent(node.name)

          if (isIframeElement || iframeComponent) {
            // .mdx requires a value for data-why to render as a specific framework
            const whyPropName = iframeComponent ? 'why' : 'data-why'

            /** @type {import('..').Options['defaultFramework']} */
            const framework =
              node.attributes.find((a) => a.name === whyPropName)?.value ||
              options?.defaultFramework

            if (!framework) {
              // TODO: generate frame
              console.warn(
                `<${node.name} ${whyPropName}> in .mdx files must specify a value for ${whyPropName}, e.g. <${node.name} ${whyPropName}="svelte">. ` +
                  `Supported frameworks include ${knownFrameworks
                    .map((f) => `"${f}"`)
                    .join(', ')}.`
              )
              return
            }
            if (!knownFrameworks.includes(framework)) {
              // TODO: generate frame
              console.warn(
                `<${node.name} ${whyPropName}="${framework}"> isn't supported. ` +
                  `Supported frameworks include ${knownFrameworks
                    .map((f) => `"${f}"`)
                    .join(', ')}.`
              )
              return
            }

            // extract iframe html
            // TODO: Astro to framework generation
            let iframeContent = ''
            if (node.children.length > 0) {
              const start = node.children[0].position.start.offset
              const end =
                node.children[node.children.length - 1].position.end.offset
              iframeContent = code.slice(start, end)
              s.remove(start, end)
            }

            // derive final hash per iframe
            const finalHash = hash(mdxEsmCode + iframeContent)

            const entryComponentId = api.createEntryComponent(
              id,
              finalHash,
              framework === 'svelte'
                ? '.svelte'
                : framework === 'vue'
                ? '.vue'
                : '.tsx',
              createEntryComponent(mdxEsmCode, iframeContent, framework)
            )

            const entryId = api.createEntry(
              id,
              finalHash,
              getEntryExtension(framework),
              createEntry(entryComponentId, framework)
            )

            let showSource = api.getDefaultShowSource()
            if (isIframeElement) {
              const attr = node.attributes.find(
                (a) => a.name === 'data-why-show-source'
              )
              if (attr && (attr.value === null || attr.value === 'true')) {
                showSource = attr.value === 'true'
              }
            } else if (iframeComponent) {
              if (typeof iframeComponent.showSource === 'boolean') {
                showSource = iframeComponent.showSource
              } else if (typeof iframeComponent.showSource === 'function') {
                const openTag = code.slice(
                  node.position.start.offset,
                  node.children[0]?.position.start.offset
                )
                showSource = iframeComponent.showSource(openTag)
              }
            }

            // inject props
            const attrs = api.getMainIframeAttrs(
              entryId,
              finalHash,
              showSource ? dedent(iframeContent) : undefined,
              !!iframeComponent
            )
            console.log('here', node, attrs)
            addAttrs(s, node, attrs)
          }
        }
      })

      if (s.hasChanged()) {
        // console.log(s.toString())
        return {
          code: s.toString(),
          map: s.generateMap()
        }
      }
    }
  }

  return plugin
}

/**
 * @param {any} framework
 */
function getEntryExtension(framework) {
  switch (framework) {
    case 'svelte':
    case 'vue':
      return '.js'
    case 'solid':
    case 'preact':
    case 'react':
      return '.jsx'
    default:
      return '.js'
  }
}

/**
 * @param {string} entryId
 * @param {import('..').Options['defaultFramework']} framework
 */
function createEntry(entryId, framework) {
  switch (framework) {
    case 'svelte':
      return `\
import App from '${entryId}'

export function createApp(el) {
  const app = new App({ target: el })
  return {
    destroy: () => app.$destroy()
  }
}`
    case 'vue':
      return `\
import { createApp as _createApp } from 'vue'
import App from '${entryId}'

export function createApp(el, opts) {
  const app = _createApp(App)
  if (opts?.enhanceApp) {
    opts.enhanceApp(app)
  }
  app.mount(el)
  return {
    destroy: () => app.unmount()
  }
}`
    case 'react':
      return `\
import React from 'react'
import ReactDOM from 'react-dom/client'
import { WhyframeApp } from '${entryId}'

export function createApp(el) {
  ReactDOM.createRoot(el).render(<WhyframeApp />)
  return {
    destroy: () => ReactDOM.createRoot(el).unmount()
  }
}`
    case 'preact':
      return `\
import { render } from 'preact'
import { WhyframeApp } from '${entryId}'

export function createApp(el) {
  render(<WhyframeApp />, el)
  return {
    destroy: () => render(null, el)
  }
}`
    case 'solid':
      return `\
import { render } from 'solid-js/web'
import { WhyframeApp } from '${entryId}'

export function createApp(el) {
  const destroy = render(() => <WhyframeApp />, el)
  return { destroy }
}`
  }
}

/**
 * @param {string} mdxEsmCode
 * @param {string} iframeHtmlCode
 * @param {import('..').Options['defaultFramework']} framework
 */
function createEntryComponent(mdxEsmCode, iframeHtmlCode, framework) {
  switch (framework) {
    case 'svelte':
      return `\
<script>
  ${mdxEsmCode}
</script>

${iframeHtmlCode}`
    case 'vue':
      return `\
<script setup>
  ${mdxEsmCode}
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

${mdxEsmCode}

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

/**
 * @param {MagicString} s
 * @param {any} node
 * @param {import('@whyframe/core').Attr[]} attrs
 */
function addAttrs(s, node, attrs) {
  const attrNames = node.attributes.map((a) => a.name)

  const safeAttrs = []
  const mixedAttrs = []
  for (const attr of attrs) {
    if (attrNames.includes(attr.name)) {
      mixedAttrs.push(attr)
    } else {
      safeAttrs.push(attr)
    }
  }

  s.appendLeft(
    node.position.start.offset + node.name.length + 1,
    safeAttrs.map((a) => ` ${a.name}=${JSON.stringify(a)}`).join('')
  )

  // TODO: figure out of mixedAttrs is needed, likely not because static html always win?
}
