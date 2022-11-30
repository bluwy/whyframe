// whyframe:entry-fa89bf51.js
import { createApp as _createApp } from 'vue'
import App from '###/input.vue__whyframe-fa89bf51.vue'

export function createApp(el, opts) {
  const app = _createApp(App)
  if (opts?.enhanceApp) {
    opts.enhanceApp(app)
  }
  app.mount(el)
  return {
    destroy: () => app.unmount()
  }
}