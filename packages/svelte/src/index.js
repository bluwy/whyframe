import { createHash } from 'node:crypto'
import path from 'node:path'
import { createFilter } from 'vite'
import { parse, walk } from 'svelte/compiler'
import MagicString from 'magic-string'

/**
 * @type {import('.').whyframeSvelte}
 */
export function whyframeSvelte(options) {
  const virtualIdToCode = new Map()
  // secondary map to track stale virtual ids on hot update
  const svelteIdToVirtualIds = new Map()
  /** @type {import('@whyframe/core').Api} */
  let whyframeApi

  const filter = createFilter(options?.include || /\.svelte$/, options?.exclude)

  return {
    name: 'whyframe:svelte',
    enforce: 'pre',
    configResolved(c) {
      whyframeApi = c.plugins.find((p) => p.name === 'whyframe:api')?.api
      if (!whyframeApi) {
        // TODO: maybe fail safe
        throw new Error('whyframe() plugin is not installed')
      }
    },
    transform(code, id) {
      if (!filter(id) || id.includes('-whyframe-')) return

      // parse instances of `<iframe why></iframe>` and extract them out as a virtual import
      const s = new MagicString(code)

      const ast = parse(code)

      // collect code needed for virtual imports, assume all these have side effects
      // prettier-ignore
      const scriptCode = ast.instance ? code.slice(ast.instance.start, ast.instance.end) : ''
      // prettier-ignore
      const moduleScriptCode = ast.module ? code.slice(ast.module.start, ast.module.end) : ''
      const cssCode = ast.css ? code.slice(ast.css.start, ast.css.end) : ''

      // Generate initial hash
      const baseHash = getHash(scriptCode + moduleScriptCode + cssCode)

      /** @type {string[]} */
      const virtualIds = []

      walk(ast.html, {
        enter: (node) => {
          if (
            node.type === 'Element' &&
            node.name === 'iframe' &&
            node.attributes.find((a) => a.name === 'why') &&
            node.children.length > 0
          ) {
            // extract iframe html
            const iframeContentStart = node.children[0].start
            const iframeContentEnd = node.children[node.children.length - 1].end
            const iframeContent = code.slice(
              iframeContentStart,
              iframeContentEnd
            )
            s.remove(iframeContentStart, iframeContentEnd)

            // derive final hash per iframe
            const finalHash = getHash(baseHash + iframeContent)

            // get iframe src
            // TODO: unify special treatment for why-template somewhere
            const customTemplateKey = node.attributes
              .find((a) => a.name === 'why-template')
              ?.value.find((v) => v.type === 'Text')?.data

            const virtualEntry = `whyframe:entry-${finalHash}`
            const virtualComponent = `${id}-whyframe-${finalHash}.svelte`
            const iframeSrc = whyframeApi.getIframeSrc(customTemplateKey)
            const iframeOnLoad = whyframeApi.getIframeLoadHandler(
              virtualEntry,
              this
            )

            virtualIds.push(virtualEntry, virtualComponent)

            s.appendLeft(
              node.start + `<iframe`.length,
              ` src="${iframeSrc}" on:load={${iframeOnLoad}}`
            )

            virtualIdToCode.set(
              virtualEntry,
              `\
import App from '${virtualComponent}'

export function createInternalApp(el) {
  new App({ target: el })
}`
            )
            // TODO: better sourcemaps
            virtualIdToCode.set(
              virtualComponent,
              `\
${moduleScriptCode}
${scriptCode}
${iframeContent}
${cssCode}`
            )
          }
        }
      })

      // save virtual imports for invalidation when file updates
      svelteIdToVirtualIds.set(id, virtualIds)

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      }
    },
    resolveId(id) {
      if (id.startsWith('whyframe:entry')) {
        return '\0' + id
      }
      // TODO: something more sane
      if (id.includes('-whyframe-')) {
        // NOTE: this gets double resolved for some reason
        if (id.startsWith(process.cwd())) {
          return id
        } else {
          return path.join(process.cwd(), id)
        }
      }
    },
    load(id) {
      if (id.startsWith('\0whyframe:entry')) {
        return virtualIdToCode.get(id.slice(1))
      }
      if (id.includes('-whyframe-')) {
        return {
          code: virtualIdToCode.get(id),
          map: { mappings: '' }
        }
      }
    },
    handleHotUpdate({ file }) {
      // Remove stale virtual ids
      // NOTE: hot update always come first before transform
      if (svelteIdToVirtualIds.has(file)) {
        const staleVirtualIds = svelteIdToVirtualIds.get(file)
        for (const id of staleVirtualIds) {
          virtualIdToCode.delete(id)
        }
      }
    }
  }
}

function getHash(text) {
  return createHash('sha256').update(text).digest('hex').substring(0, 8)
}
