import type { FilterPattern, Plugin } from 'vite'

export interface Component {
  name: string
  path: string
}

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  /**
   * If `data-why` has no value, use this fallback instead.
   */
  defaultFramework: 'svelte' | 'vue' | 'solid' | 'preact' | 'react'
  /**
   * Custom import specifiers to exclude during code extraction
   */
  importExclude?: FilterPattern
  components?: Component[]
}

export function whyframeAstro(options?: Options): Plugin
