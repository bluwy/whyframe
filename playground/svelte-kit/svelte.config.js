import adapter from '@sveltejs/adapter-auto'

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    adapter: adapter()
  },
  onwarn(warning, handler) {
    // https://github.com/sveltejs/svelte/pull/7768
    if (warning.message.includes('CustomEvent')) return
    handler(warning)
  }
}
