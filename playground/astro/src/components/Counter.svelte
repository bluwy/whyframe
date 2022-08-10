<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let max = 0

  let count = 0
  const increment = () => {
    if (max !== 0 && count >= max) {
      dispatch('max')
      document.body.style.backgroundColor = 'pink'
      alert('🚨 YOU HAVE BEEN WARNED 🚨')
      return
    }
    count += 1
  }
</script>

<button on:click={increment}>
  Count is {count}
</button>

<style>
  button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #f9f9f9;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.25s;
  }

  button:hover {
    background-color: #ced1ff;
    border-color: #646cff;
  }

  button:focus,
  button:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }
</style>
