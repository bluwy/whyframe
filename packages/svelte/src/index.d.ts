import type { FilterPattern, Plugin } from 'vite'

export interface Component {
  name: string
  path: string
}

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  components?: Component[]
}

export function whyframeSvelte(options?: Options): Plugin
