// whyframe:entry-673ba768.js
import { createApp as _createApp } from 'vue'
import App from '###/input.vue__whyframe-673ba768.vue'

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