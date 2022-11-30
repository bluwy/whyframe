import { test, expect } from '@playwright/test'
import { setup } from '../testUtils.js'

setup()

test('enhanceApp works', async ({ page }) => {
  await page.goto('/')
  const frame = page.frameLocator('#global-component')
  await expect(frame.getByText('Global component')).toHaveCount(1)
})
