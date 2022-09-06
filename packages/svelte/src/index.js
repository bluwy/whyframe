import path from 'node:path'
import { createFilter } from 'vite'
import { parse, walk } from 'svelte/compiler'
import MagicString from 'magic-string'
import { dedent, hash } from '@whyframe/core/pluginutils'

/**
 * @type {import('..').whyframeSvelte}
 */
export function whyframeSvelte(options) {
  /** @type {import('@whyframe/core').Api} */
  let api
  /** @type {any} */
  let ctx

  const filter = createFilter(options?.include || /\.svelte$/, options?.exclude)

  /** @type {import('vite').Plugin} */
  const plugin = {
    name: 'whyframe:svelte',
    enforce: 'pre',
    configResolved(c) {
      api = c.plugins.find((p) => p.name === 'whyframe:api')?.api
      if (!api) {
        // TODO: maybe fail safe
        throw new Error('whyframe() plugin is not installed')
      }
    },
    buildStart() {
      ctx = this
    },
    transform(code, id) {
      if (!filter(id)) return
      if (!api.moduleMayHaveIframe(id, code)) return

      // parse instances of `<iframe data-why></iframe>` and extract them out as a virtual import
      const s = new MagicString(code)

      const ast = parse(code)

      // collect code needed for virtual imports, assume all these have side effects
      // prettier-ignore
      const scriptCode = ast.instance ? code.slice(ast.instance.start, ast.instance.end) : ''
      // prettier-ignore
      const moduleScriptCode = ast.module ? code.slice(ast.module.start, ast.module.end) : ''
      const cssCode = ast.css ? code.slice(ast.css.start, ast.css.end) : ''

      // Generate initial hash
      const baseHash = hash(scriptCode + moduleScriptCode + cssCode)

      walk(ast.html, {
        enter(node) {
          const isIframeElement =
            node.type === 'Element' &&
            node.name === 'iframe' &&
            node.attributes.some((a) => a.name === 'data-why')

          if (isIframeElement) {
            // if contains slot, it implies that it's accepting the component's
            // slot as iframe content, we need to proxy them
            if (node.children?.some((c) => c.type === 'Slot')) {
              const attrs = api.getProxyIframeAttrs()
              addAttrs(s, node, attrs)
              s.remove(
                node.children[0].start,
                node.children[node.children.length - 1].end
              )
              this.skip()
              return
            }
          }

          const iframeComponent =
            node.type === 'InlineComponent' && api.getComponent(node.name)

          if (isIframeElement || iframeComponent) {
            // extract iframe html
            let iframeContent = ''
            if (node.children.length > 0) {
              const start = node.children[0].start
              const end = node.children[node.children.length - 1].end
              iframeContent = code.slice(start, end)
              s.remove(start, end)
            }

            // derive final hash per iframe
            const finalHash = hash(baseHash + iframeContent)

            const entryComponentId = api.createEntryComponent(
              id,
              finalHash,
              path.extname(id),
              `\
${moduleScriptCode}
${scriptCode}
${iframeContent}
${cssCode}`
            )

            const entryId = api.createEntry(
              id,
              finalHash,
              '.js',
              `\
import App from '${entryComponentId}'

export function createApp(el) {
  const app = new App({ target: el })
  return {
    destroy: () => app.$destroy()
  }
}`
            )

            let showSource = api.getDefaultShowSource()
            if (isIframeElement) {
              const attr = node.attributes.find(
                (a) => a.name === 'data-why-show-source'
              )
              if (attr) {
                if (attr.value === true) {
                  showSource = true
                } else if (attr.value[0]) {
                  showSource = attr.value[0].data === 'true'
                } else if (attr.value[0]?.expression) {
                  showSource = attr.value[0].expression.value === true
                }
              }
            } else if (iframeComponent) {
              if (typeof iframeComponent.showSource === 'boolean') {
                showSource = iframeComponent.showSource
              } else if (typeof iframeComponent.showSource === 'function') {
                const openTag = code.slice(
                  node.start,
                  node.children[0]?.start ?? node.end
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
            addAttrs(s, node, attrs)
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

  // convert to vite-plugin-svelte's api so typescript etc are already preprocessed
  const _transform = plugin.transform
  delete plugin.transform
  plugin.api = {
    sveltePreprocess: {
      markup({ content, filename }) {
        return _transform.apply(ctx, [content, filename])
      }
    }
  }

  return plugin
}

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
    node.start + node.name.length + 1,
    safeAttrs.map((a) => ` ${a.name}={${parseAttrToString(a)}}`).join('')
  )

  for (const attr of mixedAttrs) {
    const attrNode = node.attributes.find((a) => a.name === attr.name)
    if (!attrNode) continue
    const valueNode = attrNode.value?.[0]
    if (!valueNode) continue

    if (valueNode.type === 'MustacheTag') {
      // foo={foo && bar} -> foo={(foo && bar) || "fallback"}
      const expression = s.original.slice(
        valueNode.start + 1,
        valueNode.end - 1
      )
      s.overwrite(
        valueNode.start,
        valueNode.end,
        `{(${expression}) || ${parseAttrToString(attr)}}`
      )
    } else if (valueNode.type === 'AttributeShorthand') {
      // {foo} -> foo={foo || "fallback"}
      const expression = valueNode.expression.name
      s.overwrite(
        attrNode.start,
        attrNode.end,
        `${expression}={${expression} || ${parseAttrToString(attr)}}`
      )
    }
  }
}

/**
 * @param {import('@whyframe/core').Attr} attr
 */
function parseAttrToString(attr) {
  if (attr.type === 'dynamic' && typeof attr.value === 'string') {
    return `$$props.${attr.value}`
  } else {
    return JSON.stringify(attr.value)
  }
}
