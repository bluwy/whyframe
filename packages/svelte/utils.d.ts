import type { Warning } from 'svelte/types/compiler/interfaces'

/**
 * Whether the warning originates from `whyframe`'s internal processing.
 * This is usually used to suppress warnings in the `onwarn` function.
 *
 * @example
 * ```js
 * // svelte.config.js
 * import { isWhyframeWarning } from '@whyframe/svelte/utils'
 *
 * export default {
 *   onwarn(warning, handler) {
 *    if (isWhyframeWarning(warning)) return
 *    handler(warning)
 *   }
 * }
 * ```
 */
export declare function isWhyframeWarning(warning: Warning): boolean
