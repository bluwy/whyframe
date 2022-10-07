import path from 'node:path'
import { promisify } from 'node:util'
import { test } from '@playwright/test'
import { execa, execaCommand } from 'execa'
import treeKill from 'tree-kill'

const killPid = promisify(treeKill)

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
    const cwd = path.dirname(info.file)
    const url = info.project.use.baseURL
    const port = url.split(':').pop()
    cp = execa('pnpm', ['dev', '--port', port], { cwd })
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
    const cwd = path.dirname(info.file)
    const url = info.project.use.baseURL
    const port = url.split(':').pop()
    await execaCommand(`pnpm build`, { cwd })
    cp = execa('pnpm', ['preview', '--port', port], { cwd })
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
    timeout = setTimeout(() => reject(`Timeout for ${url}`), 10000)
  })

  let interval
  const fetchPromise = new Promise((resolve) => {
    setInterval(() => {
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
