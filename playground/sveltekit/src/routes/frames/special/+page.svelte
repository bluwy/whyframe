<script>
  import './style.css'
  import { createApp } from 'whyframe:app'

  /**
   * @param {HTMLElement} node
   */
  function app(node) {
    createApp(node)
  }
</script>

<svelte:head>
  <title>Whyframe - Special</title>
</svelte:head>

<div use:app />
