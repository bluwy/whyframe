<script>
  import Counter from './Counter.svelte'
  import Story from './Story.svelte'

  const max = 10

  function warn() {
    // NOTE: will affect callee's iframe, not this parent document.
    // TODO: does it make sense to be the latter?
    document.body.style.backgroundColor = 'yellow'
  }
</script>

<h1>Svelte</h1>

<iframe data-why title="Hello">
  <p>Click to increment!</p>
  <Counter />
</iframe>

<iframe data-why title="World" src="/frames/basic/index.html">
  <p>Do not go over {max}</p>
  <Counter {max} on:max={warn} />
</iframe>

<Story title="Foo">
  <p>Click to increment!</p>
  <Counter />
</Story>

<Story title="Bar" src="/frames/basic/index.html">
  <p>Do not go over {max}</p>
  <Counter {max} on:max={warn} />
</Story>
