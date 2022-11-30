declare module 'whyframe:app' {
  interface CreateAppOptions {}

  /**
   * @param el The element to mount the app to
   * @param opts Extra options added by framework plugins
   */
  export const createApp: (
    el: HTMLElement,
    opts?: CreateAppOptions
  ) => {
    destroy: () => void
  }
}
