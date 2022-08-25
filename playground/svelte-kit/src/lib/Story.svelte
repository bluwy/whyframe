<script>
  /** @type {string}*/
  export let title
</script>

<div>
  <p>
    This is a story of {title}:
  </p>

  <iframe data-why {title} {...$$restProps}>
    <slot />
  </iframe>
</div>
