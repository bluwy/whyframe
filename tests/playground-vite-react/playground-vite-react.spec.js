import { test, expect } from '@playwright/test'
import { setup } from '../testUtils.js'

setup()

test('render the page', async ({ page, baseURL }) => {
  await page.goto('/')
  expect(await page.locator('h1').textContent()).toBe('React')
})
