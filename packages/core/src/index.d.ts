import type { Plugin } from 'vite'

declare module 'whyframe:app-*' {
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
   * A map of template names to actual html in the filesystem. These html
   * will be passed to Vite to transform as is, leveraging it as another
   * entrypoint of your app. The only thing to make sure is that you call
   * this somewhere in the html's script:
   * ```ts
   * import { createApp } from 'whyframe:app-basic'
   * // ...do something...
   * // finally mount the app to a dom element
   * createApp(document.getElementById('app'))
   * ```
   */
  template?: Record<string, string>
}

export interface Api {
  /**
   * @internal
   */
  _getEntryIds: (templateName?: string) => string
  /**
   * Return an 8 character hash safe to use in urls and ids
   */
  getHash: (text: string) => string
  getMainIframeAttrs: (
    entryId: string,
    hash: string,
    templateName: string,
    isComponent: boolean,
  ) => Attr[]
  getProxyIframeAttrs: () => Attr[]
  getProxyPropNames: () => string[]
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
