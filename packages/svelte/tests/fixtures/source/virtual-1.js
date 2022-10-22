// whyframe:entry-e7fc18de.js
import App from '###/input.svelte__whyframe-e7fc18de.svelte'

export function createApp(el) {
  const app = new App({ target: el })
  return {
    destroy: () => app.$destroy()
  }
}