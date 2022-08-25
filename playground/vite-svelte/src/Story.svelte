<script>
  export let title
  export let src = $$props._why?.src
</script>

<div>
  <p>
    This is a story of {title}:
  </p>

  <iframe data-why {title} {src}>
    <slot />
  </iframe>
</div>
