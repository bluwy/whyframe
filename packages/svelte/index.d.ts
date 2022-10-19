import type { FilterPattern, Plugin } from 'vite'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  preprocess?: boolean
}

export declare function whyframeSvelte(options?: Options): Plugin
