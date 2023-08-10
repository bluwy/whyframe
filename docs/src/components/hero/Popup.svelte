<script>
  /** @type {string} */
  export let content

  let open = false
</script>

<button aria-haspopup="dialog" on:click={() => (open = !open)}><slot /></button>

{#if open}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="background" on:click={() => (open = false)}>
    <div class="card">
      <p>{content}</p>
      <button class="close">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          ><path
            d="M6.2253 4.81108C5.83477 4.42056 5.20161 4.42056 4.81108 4.81108C4.42056 5.20161 4.42056 5.83477 4.81108 6.2253L10.5858 12L4.81114 17.7747C4.42062 18.1652 4.42062 18.7984 4.81114 19.1889C5.20167 19.5794 5.83483 19.5794 6.22535 19.1889L12 13.4142L17.7747 19.1889C18.1652 19.5794 18.7984 19.5794 19.1889 19.1889C19.5794 18.7984 19.5794 18.1652 19.1889 17.7747L13.4142 12L19.189 6.2253C19.5795 5.83477 19.5795 5.20161 19.189 4.81108C18.7985 4.42056 18.1653 4.42056 17.7748 4.81108L12 10.5858L6.2253 4.81108Z"
            fill="currentColor"
          /></svg
        >
      </button>
    </div>
  </div>
{/if}

<style>
  .background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #090909;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .card {
    color: #303030;
    background-color: #efefef;
    padding: 0 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  button {
    border-radius: 6px;
    border: 1px solid transparent;
    padding: 0.5em 1em;
    font-size: 0.9em;
    font-weight: 500;
    font-family: inherit;
    background-color: #f9f9f9;
    color: #1e1e1e;
    cursor: pointer;
    transition:
      background-color 0.2s,
      border-color 0.25s;
  }

  button:hover {
    background-color: white;
    border-color: #b2b2b2;
  }

  button:focus,
  button:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }

  .close,
  .close:hover,
  .close:focus {
    background-color: transparent;
    border: none;
    padding: 0;
    margin: 0;
    margin-left: 0.8rem;
  }
</style>
