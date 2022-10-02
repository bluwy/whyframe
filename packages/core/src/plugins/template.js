import fs from 'node:fs/promises'
import path from 'node:path'

export const templateDefaultId = '__whyframe.html'
export const templateDefaultBuildPath = path.resolve(
  process.cwd(),
  templateDefaultId
)

/**
 * @param {import('../..').Options} [options]
 * @returns {import('vite').Plugin[]}
 */
export function templatePlugin(options) {
  if (!options?.defaultSrc) {
    return [templateServePlugin(), templateBuildPlugin()]
  } else {
    return []
  }
}

const templateDefaultHtml = `\
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>whyframe</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module">
      import { createApp } from 'whyframe:app'
      createApp(document.getElementById('app'))
    </script>
  </body>
</html>`

/**
 * @returns {import('vite').Plugin}
 */
function templateServePlugin() {
  return {
    name: 'whyframe:template:serve',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.endsWith(templateDefaultId)) {
          const html = await server.transformIndexHtml(
            req.url,
            templateDefaultHtml,
            req.originalUrl
          )
          res.setHeader('Content-Type', 'text/html')
          res.end(html)
        } else {
          next()
        }
      })
    }
  }
}

/**
 * @returns {import('vite').Plugin}
 */
function templateBuildPlugin() {
  return {
    name: 'whyframe:template:build',
    apply: 'build',
    config(c) {
      if (c.build == null) {
        c.build = { rollupOptions: {} }
      } else if (c.build.rollupOptions == null) {
        c.build.rollupOptions = {}
      }

      // @ts-ignore
      let input = c.build.rollupOptions.input

      if (typeof input === 'undefined' || typeof input === 'string') {
        input = {
          __whyframe: templateDefaultBuildPath,
          index: input ?? 'index.html'
        }
      } else if (Array.isArray(input)) {
        input.push(templateDefaultBuildPath)
      } else if (typeof input === 'object') {
        input.__whyframe = templateDefaultBuildPath
      }

      // @ts-ignore
      c.build.rollupOptions.input = input
    },
    async buildStart() {
      try {
        await fs.writeFile(templateDefaultBuildPath, templateDefaultHtml)
      } catch {
        console.log('Failed to write default template')
      }
    },
    async buildEnd() {
      try {
        await fs.rm(templateDefaultBuildPath)
      } catch {}
    }
  }
}
