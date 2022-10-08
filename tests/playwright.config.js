import dns from 'node:dns/promises'
import fs from 'node:fs/promises'
import { devices } from '@playwright/test'

/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    ...devices['Desktop Chrome'],
    trace: 'on-first-retry'
  },
  projects: await getProjects()
}

async function getProjects() {
  /** @type {import('@playwright/test').PlaywrightTestConfig['projects']} */
  const projects = []

  const defaultAddress = (await dns.lookup('localhost')).address
  const verbatimAddress = (await dns.lookup('localhost', { verbatim: true }))
    .address
  const address =
    defaultAddress === verbatimAddress ? 'localhost' : defaultAddress

  const testsDir = new URL('.', import.meta.url)
  const dirents = await fs.readdir(testsDir, { withFileTypes: true })

  let port = 8180

  for (const dirent of dirents) {
    if (dirent.isDirectory() && dirent.name !== 'node_modules') {
      const pkgJson = new URL(`./${dirent.name}/package.json`, testsDir)
      const testConfig =
        JSON.parse(await fs.readFile(pkgJson, 'utf8')).test ?? {}

      projects.push({
        name: dirent.name,
        testDir: `./${dirent.name}`,
        use: {
          baseURL: `http://${testConfig.address ?? address}:${port++}`
        }
      })
    }
  }

  return projects
}
