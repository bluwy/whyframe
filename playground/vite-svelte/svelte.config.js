export default {
  // TODO: export handler from `@whyframe/svelte/utils`
  onwarn(warning, handler) {
    if (warning.filename?.includes('__whyframe')) return
    handler(warning)
  }
}
