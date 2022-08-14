<script>
  /** @type {string}*/
  export let title

  // Allow arbitrary props
  $: $$props
</script>

<div>
  <p>
    This is a story of {title}:
  </p>

  <iframe data-why {title}>
    <slot />
  </iframe>
</div>
