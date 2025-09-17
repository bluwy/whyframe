// whyframe:entry-e7fc18de.js
import App from '###/input.svelte__whyframe-e7fc18de.svelte'
import { mount, unmount } from 'svelte'

export function createApp(el) {
  const app = mount(App, { target: el })
  return {
    destroy: () => unmount(app)
  }
}