import fs from 'node:fs/promises'
import path from 'node:path'
import { suite } from 'uvu'
import * as assert from 'uvu/assert'

export const isUpdate = process.argv.slice(2).includes('--update')

/**
 * Nicer test nesting API.
 * https://github.com/lukeed/uvu/issues/43
 * @param {string} name
 * @param {(test: import('uvu').Test) => void} fn
 */
export function group(name, fn) {
  const s = suite(name)
  fn(s)
  s.run()
}

/**
 * Nicer test nesting API.
 * https://github.com/lukeed/uvu/issues/43
 * @param {string} name
 * @param {(test: import('uvu').Test) => Promise<void>} fn
 */
export async function groupAsync(name, fn) {
  const s = suite(name)
  await fn(s)
  s.run()
}

/**
 * @param {string} actual
 * @param {string} outputFile
 * @param {assert.Message} [msg]
 */
export async function assertFixture(actual, outputFile, msg) {
  if (isUpdate) {
    await fs.writeFile(outputFile, actual)
  } else {
    let expects
    try {
      expects = await fs.readFile(outputFile, 'utf-8')
    } catch (e) {
      throw new Error(
        `Unable to read fixture: ${outputFile}. Did you forget to run "pnpm test:unit-update"?`,
        { cause: e }
      )
    }
    assert.fixture(actual, expects, msg)
  }
}

/**
 * @param {string} fixturesDir
 * @param {string} inputFileName
 */
export async function* getFixtures(fixturesDir, inputFileName) {
  const dirents = await fs.readdir(fixturesDir, { withFileTypes: true })
  for (const dirent of dirents) {
    if (dirent.isDirectory()) {
      try {
        const inputFile = path.join(
          fixturesDir,
          `./${dirent.name}/${inputFileName}`
        )
        yield {
          id: inputFile,
          code: await fs.readFile(inputFile, 'utf-8')
        }
      } catch {
        continue
      }
    }
  }
}

/**
 * @param {string} code
 * @param {string} comment
 * @param {string} ext
 */
export function prependComment(code, comment, ext) {
  switch (ext) {
    case '.svelte':
    case '.vue':
    case '.html':
      return `<!-- ${comment} -->\n${code}`
    default:
      return `// ${comment}\n${code}`
  }
}
