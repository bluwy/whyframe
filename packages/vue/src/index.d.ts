import type { FilterPattern, Plugin } from 'vite'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
}

export function whyframeVue(options?: Options): Plugin
