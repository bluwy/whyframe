import type { FilterPattern, Plugin } from 'vite'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
}

export declare function whyframeSvelte(options?: Options): Plugin
