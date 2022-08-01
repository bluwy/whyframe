<script>
  import Counter from './Counter.svelte'

  const max = 10
</script>

<h1>Test</h1>

<iframe why title="Hello">
  <p>Click to increment!</p>
  <Counter />
</iframe>

<iframe why title="World">
  <p>Max 10</p>
  <Counter {max} />
</iframe>
