export interface Options {
  templateHtml?: Record<string, string>
}

export interface Api {
  getIframeSrc: (templateKey?: string) => string
  getIframeLoadHandler: (virtualEntry: string) => string
}
