import path from 'node:path'
import * as assert from 'uvu/assert'
import { whyframe } from '@whyframe/core'
import { addAttrs, parseAttrToString, transform } from '../src/shared.js'
import {
  assertFixture,
  getFixtures,
  group,
  groupAsync
} from '../../../scripts/uvuUtils.js'
import { fileURLToPath } from 'node:url'

/** @type {() => import('@whyframe/core').Api} */
const api = () => whyframe()[0].api

await groupAsync('transform', async (test) => {
  const fixturesDir = fileURLToPath(new URL('./fixtures/', import.meta.url))
  const fixtures = getFixtures(fixturesDir, 'input.svelte')
  for await (const { id, code } of fixtures) {
    const shortDirName = path.basename(path.dirname(id))
    test(`fixture: ${shortDirName}`, async () => {
      const result = transform(code, id, api())
      assert.ok(result)
      const outputId = id.replace(/input\.svelte$/, 'output.svelte')
      await assertFixture(result.code, outputId)
    })
  }
})

group('addAttrs', (test) => {
  test('add attrs to element', () => {
    // todo
  })
})

group('parseAttrToString', (test) => {
  test('parse attrs to string', () => {
    // todo
  })
})
