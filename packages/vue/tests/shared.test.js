import path from 'node:path'
import * as assert from 'uvu/assert'
import { whyframe } from '@whyframe/core'
import {
  addAttrs,
  movePlugin,
  parseAttrToString,
  transform
} from '../src/shared.js'
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
  const fixtures = getFixtures(fixturesDir, 'input.vue')

  for await (const { id, code } of fixtures) {
    const shortDirName = path.basename(path.dirname(id))
    smartTest(test, shortDirName)(`fixture: ${shortDirName}`, async () => {
      const api = createApi()
      const result = transform(code, id, api)

      assert.ok(result)

      const outputId = id.replace(/input\.vue$/, 'output.vue')
      await assertFixture(result.code, outputId)

      let i = 0
      for (const [virtualId, virtualCode] of api._getVirtualIdToCode()) {
        const fileExt = path.extname(virtualId)
        const fileName = `virtual-${i++}${fileExt}`
        const virtualOutputId = id.replace(/input\.vue$/, fileName)
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

group('movePlugin', (test) => {
  test('before if before', () => {
    const plugins = ['a', 'b', 'c', 'd'].map((name) => ({ name }))
    movePlugin(plugins, 'a', 'before', 'c')
    assert.equal(
      plugins.map((p) => p.name),
      ['a', 'b', 'c', 'd']
    )
  })

  test('before if after', () => {
    const plugins = ['a', 'b', 'c', 'd'].map((name) => ({ name }))
    movePlugin(plugins, 'd', 'before', 'b')
    assert.equal(
      plugins.map((p) => p.name),
      ['a', 'd', 'b', 'c']
    )
  })

  test('after if before', () => {
    const plugins = ['a', 'b', 'c', 'd'].map((name) => ({ name }))
    movePlugin(plugins, 'a', 'after', 'c')
    assert.equal(
      plugins.map((p) => p.name),
      ['b', 'c', 'a', 'd']
    )
  })

  test('after if after', () => {
    const plugins = ['a', 'b', 'c', 'd'].map((name) => ({ name }))
    movePlugin(plugins, 'd', 'after', 'b')
    assert.equal(
      plugins.map((p) => p.name),
      ['a', 'b', 'c', 'd']
    )
  })
})
