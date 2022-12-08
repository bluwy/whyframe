import type { Plugin } from 'vite'

type LoadResult = Awaited<ReturnType<NonNullable<Plugin['load']>>>

export interface Attr {
  type: 'static' | 'dynamic'
  name: string
  value: string | Record<string, any>
}

export interface Component {
  /**
   * The name of the component used to detect via `<${name} />`
   */
  name: string
}

export interface Options {
  /**
   * The default iframe src if one is not provided. For supported frameworks,
   * this will default to a generic internal whyframe html. Otherwise, a custom
   * html is required to be passed.
   */
  defaultSrc?: string
  /**
   * A list of components that contain an `iframe` that renders what's passed
   * to the component, e.g. via slots or children.
   */
  components?: Component[]
}

export interface Api {
  /**
   * @internal
   */
  _getHashToEntryIds: () => Map<string, string>
  /**
   * @internal
   */
  _getVirtualIdToCode: () => Map<string, string>
  /**
   * Check if a component name contains an iframe.
   */
  getComponent: (componentName: string) => Component | undefined
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
   * Create an entry for the iframe. This is later imported by `whyframe:app` which
   * invokes this virtual module's `createApp` function. The entry must conform to
   * this export dts:
   * ```ts
   * // can return promise if needed, or nothing at all
   * export const createApp: (el: HTMLElement) => { destroy: () => void }
   * ```
   */
  createEntry: (
    originalId: string,
    hash: string,
    ext: string,
    code: LoadResult
  ) => string
  /**
   * The entry for the iframe would load a virtual component. This creates it.
   * Usually this contains code extracted from the iframe content, plus any other
   * side-effectful code, like imports, outer functions, etc.
   */
  createEntryComponent: (
    originalId: string,
    hash: string,
    ext: string,
    code: LoadResult
  ) => string
  /**
   * The entry may contain metadata to be exposed. They can be imported via `whyframe:iframe`
   * so it can be treeshaken. The third parameter is a function that's lazily called
   * as it's anticipated to be heavy.
   */
  createEntryMetadata: (
    originalId: string,
    iframeKey: string,
    code: () => string | Promise<string>
  ) => string
}

export declare function whyframe(options?: Options): Plugin[]
