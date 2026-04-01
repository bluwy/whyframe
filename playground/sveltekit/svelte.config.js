import { isWhyframeWarning } from '@whyframe/svelte/utils'
import adapter from '@sveltejs/adapter-auto'

/** @type {import('@sveltejs/kit').Config} */
export default {
  onwarn(warning, handler) {
    if (isWhyframeWarning(warning)) return
    handler(warning)
  },
  kit: {
    adapter: adapter()
  }
}
