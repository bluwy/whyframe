import type { ParserOptions } from '@vue/compiler-dom'
import type { App } from 'vue'
import type { FilterPattern, Plugin } from 'vite'

// TODO: Make `vue` a peer dep for types in next breaking change
declare module 'whyframe:app' {
  interface CreateAppOptions {
    /**
     * **[Vue]** Hook to update the app, e.g. adding global components, before
     * mounting the app to the element.
     */
    enhanceApp: (app: App) => void
  }
}

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
