import fs from 'node:fs/promises'
import path from 'node:path'

export const templateDefaultId = 'whyframe-template-default.html'
export const templateDefaultBuildPath = path.resolve(
  process.cwd(),
  templateDefaultId
)

/**
 * @param {import('..').Options} [options]
 * @returns {import('vite').Plugin[]}
 */
export function templatePlugin(options) {
  if (!options?.template?.default) {
    return [templateServePlugin(), templateBuildPlugin()]
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
        if (req.url.endsWith(templateDefaultId)) {
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
    async buildStart() {
      try {
        await fs.writeFile(templateDefaultBuildPath, templateDefaultHtml)
      } catch {
        // TODO: use debug
        console.log('Failed to write default template')
      }
    },
    async buildEnd() {
      try {
        await fs.rm(templateDefaultBuildPath)
      } catch {
        // TODO: use debug
        console.log('Failed to remove default template')
      }
    }
  }
}
