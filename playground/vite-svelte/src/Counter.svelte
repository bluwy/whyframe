<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let max = 0

  let count = 0
  const increment = () => {
    if (max !== 0 && count >= max) {
      dispatch('max')
      document.body.style.backgroundColor = 'pink'
      alert('too many clicks')
      return
    }
    count += 1
  }
</script>

<button on:click={increment}>
  count is {count}
</button>
