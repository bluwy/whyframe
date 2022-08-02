import fs from 'node:fs/promises'
import path from 'node:path'

export const fallbackTemplateId = 'whyframe:fallback-template.html'

export const fallbackTemplateBuildPath = path.resolve(
  process.cwd(),
  '__whyframe-temp.html'
)

/**
 * @returns {import('vite').Plugin[]}
 */
export function fallbackTemplatePlugin() {
  return [fallbackTemplateServePlugin(), fallbackTemplateBuildPlugin()]
}

const fallbackTemplateHtml = `\
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>whyframe</title>
  </head>
  <body>
    <div id="whyframe-app"></div>
  </body>
</html>`

/**
 * @returns {import('vite').Plugin}
 */
function fallbackTemplateServePlugin() {
  return {
    name: 'whyframe:fallback-template:serve',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url.includes(fallbackTemplateId)) {
          const html = await server.transformIndexHtml(
            req.url,
            fallbackTemplateHtml,
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
function fallbackTemplateBuildPlugin() {
  return {
    name: 'whyframe:fallback-template:build',
    apply: 'build',
    async buildStart() {
      try {
        await fs.writeFile(fallbackTemplateBuildPath, fallbackTemplateHtml)
      } catch {
        // TODO: use debug
        console.log('Failed to write fallback template')
      }
    },
    async buildEnd() {
      try {
        await fs.rm(fallbackTemplateBuildPath)
      } catch {
        // TODO: use debug
        console.log('Failed to remove fallback template')
      }
    }
  }
}
