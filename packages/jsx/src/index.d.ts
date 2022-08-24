import type { ParserOptions } from '@babel/parser'
import type { FilterPattern, Plugin } from 'vite'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  parserOptions?: ParserOptions
  /**
   * Default framework to use if it can't be detected via a `@jsxImportSource <framework>`
   * comment at the top of the JSX file, or from `jsxImportSource` option in tsconfig.json.
   */
  framework?: 'react' | 'preact' | 'solid'
}

export function whyframeJsx(options?: Options): Plugin
