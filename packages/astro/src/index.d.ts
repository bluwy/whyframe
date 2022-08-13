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
  components?: Component[]
}

export function whyframeAstro(options?: Options): Plugin
