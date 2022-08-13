import type { ParserOptions } from '@vue/compiler-dom'
import type { FilterPattern, Plugin } from 'vite'

export interface Component {
  name: string
  path: string
}

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  parserOptions?: ParserOptions
  components?: Component[]
}

export function whyframeVue(options?: Options): Plugin
