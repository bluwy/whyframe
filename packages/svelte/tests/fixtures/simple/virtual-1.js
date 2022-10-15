// whyframe:entry-673ba768.js
import App from '###/input.svelte__whyframe-673ba768.svelte'

export function createApp(el) {
  const app = new App({ target: el })
  return {
    destroy: () => app.$destroy()
  }
}