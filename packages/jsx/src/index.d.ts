import type { FilterPattern, Plugin } from 'vite'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  framework: 'react' | 'preact' | 'solid'
}

export function whyframeJsx(options: Options): Plugin
