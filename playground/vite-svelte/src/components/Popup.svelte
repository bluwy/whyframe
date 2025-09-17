<script>
  /** @type {string} */
  export let content

  let open = false
</script>

<button class="activator" aria-haspopup="dialog" onclick={() => (open = !open)}>
  <slot />
</button>

{#if open}
  <button class="background" onclick={() => (open = false)}>
    <p>{content}</p>
  </button>
{/if}

<style>
  .activator {
    display: block;
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.5em 1em;
    font-size: 0.9em;
    font-weight: 500;
    font-family: inherit;
    color: #efefef;
    background-color: #1e1e1e;
    cursor: pointer;
    transition: border-color 0.25s;
  }

  .activator:hover {
    border-color: #ffed24;
  }

  .activator:focus,
  .activator:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }

  .background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
    background-color: #090909;
    color: #efefef;
    font-size: 1.5rem;
    opacity: 0.8;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .background:focus,
  .background:focus-visible {
    border: 4px solid #ffed24;
  }
</style>
