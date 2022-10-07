import dns from 'node:dns/promises'
import fs from 'node:fs/promises'
import { devices } from '@playwright/test'

/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
  use: {
    ...devices['Desktop Chrome']
  },
  projects: await getProjects()
}

async function getProjects() {
  /** @type {import('@playwright/test').PlaywrightTestConfig['projects']} */
  const projects = []

  const address = (await dns.lookup('localhost')).address
  const testsDir = new URL('.', import.meta.url)
  const dirents = await fs.readdir(testsDir, { withFileTypes: true })

  let port = 8180

  for (const dirent of dirents) {
    if (dirent.isDirectory() && dirent.name !== 'node_modules') {
      projects.push({
        name: dirent.name,
        testDir: `./${dirent.name}`,
        use: {
          baseURL: `http://${address}:${port++}`
        }
      })
    }
  }

  return projects
}
