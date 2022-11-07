import { isWhyframeWarning } from '@whyframe/svelte/utils'
import adapter from '@sveltejs/adapter-auto'
import { mdsvex } from 'mdsvex'

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [mdsvex()],
  onwarn(warning, handler) {
    if (isWhyframeWarning(warning)) return
    handler(warning)
  },
  kit: {
    adapter: adapter()
  }
}
