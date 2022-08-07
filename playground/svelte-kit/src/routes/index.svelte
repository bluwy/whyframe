<script>
  import Counter from '$lib/Counter.svelte'

  const max = 10

  function warn() {
    // NOTE: will affect callee's iframe, not this parent document.
    // TODO: does it make sense to be the latter?
    document.body.style.backgroundColor = 'yellow'
  }
</script>

<h1>SvelteKit</h1>

<iframe data-why title="Hello">
  <p>Click to increment!</p>
  <Counter />
</iframe>

<iframe data-why title="World" data-why-template="basic">
  <p>Do not go over {max}</p>
  <Counter {max} on:max={warn} />
</iframe>
