import { promisify } from 'node:util'
import { test } from '@playwright/test'
import { execa, execaCommand } from 'execa'
import treeKill from 'tree-kill'

const killPid = promisify(treeKill)
const beforeAllTimeout = process.env.CI ? 60000 : 30000
const waitUrlTimeout = process.env.CI ? 30000 : 15000

export const isDev = !process.env.TEST_BUILD
export const isBuild = !!process.env.TEST_BUILD

export function setup() {
  if (isDev) {
    setupDevServer()
  } else {
    setupPreviewServer()
  }
}

function setupDevServer() {
  /** @type {import('execa').ExecaChildProcess<string>} */
  let cp

  test.beforeAll(async ({ request }, info) => {
    test.setTimeout(beforeAllTimeout)
    const cwd = info.project.testDir
    const url = info.project.use.baseURL
    const port = url.split(':').pop()
    cp = execa('pnpm', ['dev', '--port', port], {
      cwd,
      env: { PORT: port }
    })
    await waitUrlReady(url, request)
  })

  test.afterAll(async () => {
    await killPid(cp.pid)
  })
}

function setupPreviewServer() {
  /** @type {import('execa').ExecaChildProcess<string>} */
  let cp

  test.beforeAll(async ({ request }, info) => {
    test.setTimeout(beforeAllTimeout)
    const cwd = info.project.testDir
    const url = info.project.use.baseURL
    const port = url.split(':').pop()
    await execaCommand(`pnpm build`, { cwd })
    cp = execa('pnpm', ['preview', '--port', port], {
      cwd,
      env: { PORT: port }
    })
    await waitUrlReady(url, request)
  })

  test.afterAll(async () => {
    await killPid(cp.pid)
  })
}

/**
 * @param {string} url
 * @param {import('@playwright/test').APIRequestContext} request
 */
async function waitUrlReady(url, request) {
  let timeout
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(`Timeout for ${url}`), waitUrlTimeout)
  })

  let interval
  const fetchPromise = new Promise((resolve) => {
    interval = setInterval(() => {
      request
        .fetch(url)
        .then((res) => {
          if (res.ok()) {
            resolve()
          }
        })
        .catch(() => {})
    }, 1000)
  })

  return Promise.race([timeoutPromise, fetchPromise]).finally(() => {
    clearTimeout(timeout)
    clearInterval(interval)
  })
}
