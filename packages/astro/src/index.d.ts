import type { FilterPattern, Plugin } from 'vite'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  /**
   * If `data-why` has no value, use this fallback instead.
   */
  defaultFramework: 'svelte' | 'vue' | 'solid' | 'preact' | 'react'
}

export function whyframeAstro(options?: Options): Plugin
