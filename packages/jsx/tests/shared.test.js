import path from 'node:path'
import * as assert from 'uvu/assert'
import { whyframe } from '@whyframe/core'
import { addAttrs, parseAttrToString, transform } from '../src/shared.js'
import {
  assertFixture,
  getFixtures,
  group,
  groupAsync,
  prependComment,
  smartTest
} from '../../../scripts/uvuUtils.js'
import { fileURLToPath } from 'node:url'

/** @type {() => import('@whyframe/core').Api} */
const createApi = () => whyframe()[0].api

await groupAsync('transform', async (test) => {
  const fixturesDir = fileURLToPath(new URL('./fixtures/', import.meta.url))
  const fixtures = getFixtures(fixturesDir, 'input.jsx')

  for await (const { id, code } of fixtures) {
    const shortDirName = path.basename(path.dirname(id))
    const framework =
      /** @type {import('../index').Options['defaultFramework']} */ (
        shortDirName.split('-')[0]
      )
    smartTest(test, shortDirName)(`fixture: ${shortDirName}`, async () => {
      const api = createApi()
      const result = transform(code, id, api, {
        fallbackFramework: framework
      })

      assert.ok(result)

      const outputId = id.replace(/input\.jsx$/, 'output.jsx')
      await assertFixture(result.code, outputId)

      let i = 0
      for (const [virtualId, virtualCode] of api._getVirtualIdToCode()) {
        const fileExt = path.extname(virtualId)
        const fileName = `virtual-${i++}${fileExt}`
        const virtualOutputId = id.replace(/input\.jsx$/, fileName)
        const finalCode = prependComment(
          virtualCode,
          virtualId,
          fileExt
        ).replaceAll(path.dirname(id), '###')

        await assertFixture(finalCode, virtualOutputId)
      }
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
