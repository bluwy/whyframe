<script>
  import Counter from '$lib/Counter.svelte'
  import Story from '$lib/Story.svelte'

  const max = 10

  function warn() {
    // NOTE: will affect callee's iframe, not this parent document
    console.log('warn!')
  }
</script>

<h1>SvelteKit</h1>

<iframe data-why title="Hello">
  <p>Click to increment!</p>
  <Counter />
</iframe>

<iframe data-why title="World" src="/frames/basic">
  <p>Do not go over {max}</p>
  <Counter {max} on:max={warn} />
</iframe>

<Story title="Foo">
  <p>Click to increment!</p>
  <Counter />
</Story>

<Story title="Bar" src="/frames/basic">
  <p>Do not go over {max}</p>
  <Counter {max} on:max={warn} />
</Story>
