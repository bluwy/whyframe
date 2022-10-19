import adapter from '@sveltejs/adapter-auto'
import { mdsvex } from 'mdsvex'

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [mdsvex()],
  kit: {
    adapter: adapter()
  }
}
