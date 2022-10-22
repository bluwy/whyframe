// whyframe:entry-fa89bf51.js
import { createApp as _createApp } from 'vue'
import App from '###/input.vue__whyframe-fa89bf51.vue'

export function createApp(el) {
  const app = _createApp(App)
  app.mount(el)
  return {
    destroy: () => app.unmount()
  }
}