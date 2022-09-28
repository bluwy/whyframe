import type { Compiler } from 'webpack'
import type { Options as _Options } from './index.js'

export interface Options extends Omit<_Options, 'include' | 'exclude'> {}

// also implements `Api`
export class WhyframePlugin {
  constructor(options?: Options) {}
  apply: (compiler: Compiler) => void
}
