import fs from 'node:fs'

const coreDts = fs.readFileSync('../packages/core/src/index.d.ts', 'utf8')

export const coreComponentDts = coreDts.match(/interface Component.*?^}/ms)[0]

export const coreApiDts = coreDts.match(/interface Api.*?^}/ms)[0]

export const coreUtilsDts = fs.readFileSync(
  '../packages/core/src/utils.d.ts',
  'utf8'
)

export const corePluginutilsDts = fs.readFileSync(
  '../packages/core/src/pluginutils.d.ts',
  'utf8'
)

const svelteDts = fs.readFileSync('../packages/svelte/src/index.d.ts', 'utf8')
const vueDts = fs.readFileSync('../packages/vue/src/index.d.ts', 'utf8')
const jsxDts = fs.readFileSync('../packages/jsx/src/index.d.ts', 'utf8')
const astroDts = fs.readFileSync('../packages/astro/src/index.d.ts', 'utf8')
