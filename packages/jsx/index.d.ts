import type { ParserOptions } from '@babel/parser'
import type { FilterPattern, Plugin } from 'vite'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern
  /**
   * The default UI framework for this integration. If not set, it try to
   * fallback to the `jsxImportSource` option in `tsconfig.json` or `jsconfig.json`.
   * This can be overridden per iframe with `data-why="<framework>"` attribute,
   * or per file with the `@jsxImportSource <framework>` comment at the top of
   * the JSX file.
   */
  defaultFramework?: 'solid' | 'preact' | 'react'
  /**
   * Custom parser options to be passed to `@babel/parser`
   */
  parserOptions?: ParserOptions
}

export function whyframeJsx(options?: Options): Plugin
