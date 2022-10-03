// TODO: generic for name & payload types
export interface Rpc {
  send: (name: string, payload: any) => void
  on: (name: string, callback: (payload: any) => void) => void
  off: (name: string, callback?: (payload: any) => void) => void
  teardown: () => void
}

/**
 * Create a bridge between the current page and the iframe and communicate
 * via a remote procedure call API. The current page should pass a reference
 * to the iframe as the first parameter, while the iframe can skip it.
 */
export declare function createIframeRpc(iframe?: HTMLIFrameElement): Rpc

/**
 * Get the source of the iframe injected by whyframe
 */
export declare function getWhyframeSource(
  iframe: HTMLIFrameElement
): string | undefined
