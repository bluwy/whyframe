import type { ParserOptions } from '@vue/compiler-dom'
import type { FilterPattern, Plugin } from 'vite'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  parserOptions?: ParserOptions
  /**
   * Add experimental comptibility code to support the latest version on Nuxt 3.
   * This may break between new releases unless upgraded with Nuxt together.
   * Note: this option isn't required for Nuxt 3.0.0-rc.11 and below.
   * @experimental
   */
  nuxtCompat?: boolean
}

export declare function whyframeVue(options?: Options): Plugin
