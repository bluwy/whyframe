<script>
  import { getWhyframeSource } from '@whyframe/core/utils'

  /** @type {string} */
  export let title
  /** @type {string} */
  export let src

  /** @type {HTMLIFrameElement}*/
  let iframe
  $: source = iframe ? getWhyframeSource(iframe) : undefined
</script>

<div>
  <p>
    This is a story of {title}:
  </p>

  <iframe bind:this={iframe} data-why {title} {src}>
    <slot />
  </iframe>

  <details>
    <summary>source</summary>
    <pre>{source}</pre>
  </details>
</div>
