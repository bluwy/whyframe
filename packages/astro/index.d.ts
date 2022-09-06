import type { FilterPattern, Plugin } from 'vite'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  /**
   * All `iframe`s require a value for `data-why` to render the HTML content
   * using a specific UI framework. If unset, it can fallback to this value.
   */
  defaultFramework?: 'svelte' | 'vue' | 'solid' | 'preact' | 'react'
}

export function whyframeAstro(options?: Options): Plugin
