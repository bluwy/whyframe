import type { ParserOptions } from '@babel/parser'
import type { FilterPattern, Plugin } from 'vite'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  /**
   * The UI framework for this integration. If not set, it try to fallback to
   * the `jsxImportSource` option in `tsconfig.json`. This can be overridden
   * per file with the `@jsxImportSource <framework>` comment at the top of
   * the JSX file.
   */
  framework?: 'solid' | 'preact' | 'preact'
  /**
   * Custom parser options to be passed to `@babel/parser`
   */
  parserOptions?: ParserOptions
}

export function whyframeJsx(options?: Options): Plugin
