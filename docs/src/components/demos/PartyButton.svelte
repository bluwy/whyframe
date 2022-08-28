<script>
  function randomColor() {
    // color based on #ffac24
    return `hsl(${Math.round(Math.random() * 360)}, 100%, 57%)`
  }
</script>

<button on:click={() => (document.body.style.backgroundColor = randomColor())}>
  Party
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
    background-color: white;
    border-color: #b2b2b2;
  }

  button:focus,
  button:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }
</style>
