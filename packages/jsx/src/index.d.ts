import type { ParserOptions } from '@babel/parser'
import type { FilterPattern, Plugin } from 'vite'

export interface Component {
  name: string
  path: string
  export: string
}

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  parserOptions?: ParserOptions
  components?: Component[]
  // TODO: auto detect and configurable
  framework: 'react' | 'preact' | 'solid'
}

export function whyframeJsx(options: Options): Plugin
