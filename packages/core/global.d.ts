declare module 'whyframe:app' {
  export const createApp: (el: HTMLElement) => {
    destroy: () => void
  }
}
