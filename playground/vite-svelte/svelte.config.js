import { isWhyframeWarning } from '@whyframe/svelte/utils'

export default {
  onwarn(warning, handler) {
    if (isWhyframeWarning(warning)) return
    handler(warning)
  }
}
