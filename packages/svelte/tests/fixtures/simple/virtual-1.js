// whyframe:entry-673ba768.js
import App from '###/input.svelte__whyframe-673ba768.svelte'
import { mount, unmount } from 'svelte'

export function createApp(el) {
  const app = mount(App, { target: el })
  return {
    destroy: () => unmount(app)
  }
}