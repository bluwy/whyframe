import type { Options as _Options } from '@whyframe/core/webpack'
import type { LoadContext, Plugin } from '@docusaurus/types'
import type { ParserOptions } from '@babel/parser'

export interface Options extends _Options {
  parserOptions?: ParserOptions
}

export default function whyframe(context: LoadContext, options: Options): Plugin
