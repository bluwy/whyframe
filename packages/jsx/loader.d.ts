import type { LoaderContext } from 'webpack'
import type { Options as _Options } from './index.js'

export interface Options extends Omit<_Options, 'include' | 'exclude'> {}

export default function whyframeJsxLoader(
  this: LoaderContext<Options>,
  code: string
): Promise<void> | void
