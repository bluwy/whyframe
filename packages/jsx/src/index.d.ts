import type { ParserOptions } from '@babel/parser'
import type { FilterPattern, Plugin } from 'vite'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  parserOptions?: ParserOptions
  // TODO: auto detect and configurable
  framework: 'react' | 'preact' | 'solid'
}

export function whyframeJsx(options: Options): Plugin
