import { createHash } from 'node:crypto'

/**
 * @param {string} str
 */
export function hash(str) {
  return createHash('sha256').update(str).digest('hex').substring(0, 8)
}

/**
 * @param {string} str
 */
export function dedent(str) {
  const match = str.match(/^[ \t]*(?=\S)/gm)
  if (!match) {
    return str
  }
  const indent = Math.min(...match.map((x) => x.length))
  const re = new RegExp(`^[ \\t]{${indent}}`, 'gm')
  return str.replace(re, '')
}
