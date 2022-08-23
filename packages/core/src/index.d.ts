import type { Plugin } from 'vite'

declare module 'whyframe:app' {
  export const createApp: (el: HTMLElement) => void
}

type LoadResult = Awaited<ReturnType<NonNullable<Plugin['load']>>>

export interface Attr {
  type: 'static' | 'dynamic'
  name: string
  value: string
}

export interface Options {
  /**
   * A map of template names to the serving url path.
   */
  template?: Record<string, string>
  /**
   * A list of component names that contains an `iframe` that renders
   * what's passed into the component, e.g. via slots or children.
   */
  components?: string[]
}

export interface Api {
  /**
   * @internal
   */
  _getHashToEntryIds: () => Map<string, string>
  /**
   * Check if a component name contains an iframe.
   */
  isIframeComponent: (componentName: string) => boolean
  /**
   * A utility to check if a module may contain an iframe to quickly skip parsing.
   */
  moduleMayHaveIframe: (id: string, code: string) => boolean
  /**
   * Get the main iframe attrs, including `<iframe>` and custom `<Story>`.
   * This should be differentiated via `isComponent`.
   */
  getMainIframeAttrs: (
    entryId: string,
    hash: string,
    templateName: string,
    isComponent: boolean
  ) => Attr[]
  /**
   * If you're using a custom `<Story>` component, the `<iframe>` within it
   * needs to be processed differently. In short, it needs to received props
   * of `<Story>` and pass it to the `<iframe>` (aka proxying). This will generate
   * the attrs required for this interaction.
   */
  getProxyIframeAttrs: () => Attr[]
  /**
   * Create a whyframe entry that's imported by the iframe load handler.
   * This entry must conform to this export dts:
   * ```ts
   * // can return promise if needed, or nothing at all
   * export function createApp(el: HtmlElement): any
   * ```
   */
  createEntry: (
    originalId: string,
    hash: string,
    ext: string,
    code: LoadResult
  ) => string
  /**
   * A component loaded by the entry. You're in charge of importing this
   * in the entry code. Usually this contains code extracted from the iframe content,
   * plus any other side-effectful code, like imports, outer functions, etc.
   */
  createEntryComponent: (
    originalId: string,
    hash: string,
    ext: string,
    code: LoadResult
  ) => string
}

export function whyframe(options?: Options): Plugin[]
