import { test, expect } from '@playwright/test'
import { setupDevServer, setupPreviewServer } from '../testUtils.js'

test.describe('dev', () => {
  setupDevServer()

  test('render the page', async ({ page }) => {
    await page.goto('/')
    expect(await page.locator('h1').textContent()).toBe('Vue')
  })
})

test.describe('build', () => {
  setupPreviewServer()

  test('render the page', async ({ page }) => {
    await page.goto('/')
    expect(await page.locator('h1').textContent()).toBe('Vue')
  })
})
