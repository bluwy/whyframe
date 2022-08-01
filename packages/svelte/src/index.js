import { createHash } from 'node:crypto'
import path from 'node:path'
import { parse, walk } from 'svelte/compiler'
import MagicString from 'magic-string'

export function whyframeSvelte() {
  // TODO: invalidate stale
  const virtualIdToCode = new Map()
  return {
    name: 'whyframe:svelte',
    enforce: 'pre',
    transform(code, id) {
      // TODO: filter
      if (!id.endsWith('.svelte')) return

      // parse instances of `<WhyFrame></WhyFrame>` and extract them out as a virtual import
      const s = new MagicString(code)
      const imports = new Map()

      const ast = parse(code)

      // prettier-ignore
      const scriptCode = ast.script ? code.slice(ast.script.start, ast.script.end) : ''
      // prettier-ignore
      const moduleScriptCode = ast.module ? code.slice(ast.module.start, ast.module.end) : ''
      const cssCode = ast.css ? code.slice(ast.css.start, ast.css.end) : ''

      const baseHash = getHash(scriptCode + moduleScriptCode + cssCode)

      walk(ast.html, {
        enter(node) {
          if (
            node.type === 'Element' &&
            node.name === 'iframe' &&
            node.attributes.find((a) => a.name === 'why') &&
            node.children.length > 0
          ) {
            const iframeContentStart = node.children[0].start
            const iframeContentEnd = node.children[node.children.length - 1].end
            const iframeContent = code.slice(
              iframeContentStart,
              iframeContentEnd
            )
            s.remove(iframeContentStart, iframeContentEnd)
            const finalHash = getHash(baseHash + iframeContent)
            const virtualIframeHtml = `whyframe:html-${finalHash}.html`
            const virtualEntryJs = `whyframe:entry-${finalHash}.js`
            const virtualComponent = `${id}-whyframe-${finalHash}.svelte`
            // const importVar = `__WHYFRAME_${finalHash}__`
            // imports.set(virtualIframeHtml, importVar)
            s.appendLeft(
              node.start + `<iframe`.length,
              ` src="/${virtualIframeHtml}"`
            )
            virtualIdToCode.set(
              virtualIframeHtml,
              `\
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>iframe</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module">
      import "${virtualEntryJs}"
    </script>
  </body>
</html>`
            )
            virtualIdToCode.set(
              virtualEntryJs,
              `\
import App from '${virtualComponent}'
new App({ target: document.getElementById('app') })`
            )
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

      if (imports.size) {
        let importText = ''
        for (const [path, importName] of imports.entries()) {
          importText += `import ${importName} from "${path}";`
        }
        if (ast.module) {
          s.appendLeft(ast.module.content.start, importText)
        } else if (ast.instance) {
          s.appendLeft(ast.instance.content.start, importText)
        } else {
          s.append(`<script>${importText}</script>`)
        }
      }

      return {
        code: s.toString(),
        map: s.generateMap({ hires: true })
      }
    },
    resolveId(id) {
      if (id.startsWith('whyframe:')) {
        return '\0' + id
      }
      if (id.includes('-whyframe-')) {
        return id
      }
    },
    load(id) {
      if (id.startsWith('\0whyframe:') || id.includes('-whyframe-')) {
        // TODO: resolve with root?
        const virtualId = id.includes('-whyframe-')
          ? path.join(process.cwd(), id)
          : id.slice(1)
        return virtualIdToCode.get(virtualId)
      }
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url.startsWith('/whyframe:')) {
          let html = virtualIdToCode.get(req.url.slice(1))
          if (html) {
            html = await server.transformIndexHtml(
              req.url,
              html,
              req.originalUrl
            )
            res.setHeader('Content-Type', 'text/html')
            res.end(html)
          } else {
            next()
          }
        } else {
          next()
        }
      })
    }
  }
}

function getHash(text) {
  return createHash('sha256').update(text).digest('hex').substring(0, 8)
}
