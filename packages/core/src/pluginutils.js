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

// Credit: https://github.com/sveltejs/svelte/blob/012d639b42f6562f1df42d5bc9f3c79dbc0fd899/src/runtime/internal/ssr.ts#L72-L96
const ATTR_REGEX = /[&"]/g

// credit: Svelte
/**
 * @param {string} value
 */
export function escapeAttr(value) {
  const str = String(value)

  const pattern = ATTR_REGEX
  pattern.lastIndex = 0

  let escaped = ''
  let last = 0

  while (pattern.test(str)) {
    const i = pattern.lastIndex - 1
    const ch = str[i]
    escaped +=
      str.substring(last, i) +
      (ch === '&' ? '&amp;' : ch === '"' ? '&quot;' : '&lt;')
    last = i + 1
  }

  return escaped + str.substring(last)
}
