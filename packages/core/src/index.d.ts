import type { Plugin } from 'vite'

declare module 'whyframe:app' {
  export const createApp: (el: HTMLElement) => {
    destroy: () => void
  }
}

type LoadResult = Awaited<ReturnType<NonNullable<Plugin['load']>>>

export interface Attr {
  type: 'static' | 'dynamic'
  name: string
  value: string
}

export interface Component {
  /**
   * The name of the component used to detect via `<${name} />`
   */
  name: string
  /**
   * Whether to attach metadata of the raw source code by default. This defaults
   * to the root `defaultShowSource` option, but can be overidden here. When a
   * function is provided, a raw tag string like `<Component foo="bar">` will be
   * passed and the function get decide whether to show the source or not, e.g.
   * loosely checking for a prop to exist.
   */
  showSource?: boolean | ((openTag: string) => boolean)
}

export interface Options {
  /**
   * The default iframe src if one is not provided. For supported frameworks,
   * this will default to a generic internal whyframe html. Otherwise, a custom
   * html is required to be passed.
   */
  defaultSrc?: string
  /**
   * Whether to attach metadata of the raw source code for all iframes or
   * components by default. Since the source can't be treeshaken by default,
   * this is false by default.
   *
   * For iframes, this can be enabled or disabled individually using the `data-why-show-source`
   * attribute. For components, this can be configured via its `showSource` option.
   */
  defaultShowSource?: boolean
  /**
   * A list of component names that contains an `iframe` that renders
   * what's passed into the component, e.g. via slots or children.
   */
  components?: Component[]
}

export interface Api {
  /**
   * @internal
   */
  _getHashToEntryIds: () => Map<string, string>
  /**
   * Check if a component name contains an iframe.
   */
  getComponent: (componentName: string) => Component | undefined
  /**
   * A utility to check if a module may contain an iframe to quickly skip parsing.
   */
  moduleMayHaveIframe: (id: string, code: string) => boolean
  getDefaultShowSource: () => boolean
  /**
   * Get the main iframe attrs, including `<iframe>` and custom `<Story>`.
   * This should be differentiated via `isComponent`.
   */
  getMainIframeAttrs: (
    entryId: string,
    hash: string,
    source: string | undefined,
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
