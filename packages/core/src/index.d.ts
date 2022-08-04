import type { Plugin } from 'vite'

type PluginContext = ThisParameterType<NonNullable<Plugin['resolveId']>>

export interface Options {
  templateHtml?: Record<string, string>
}

export interface Api {
  getIframeSrc: (templateKey?: string) => string
  getIframeLoadHandler: (virtualEntry: string, ctx: PluginContext) => string
}
