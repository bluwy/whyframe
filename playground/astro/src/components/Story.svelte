<script>
  import { getWhyframeSource } from '@whyframe/core/utils'

  /** @type {string} */
  export let title
  export let src = '/frames/special.html'

  /** @type {HTMLIFrameElement}*/
  let iframe
  $: source = iframe ? getWhyframeSource(iframe) : undefined

  let showCode = false
</script>

<div class="story">
  <div class="bar">
    <h2>{title}</h2>
    <button aria-pressed={showCode} on:click={() => (showCode = !showCode)}>
      Show code
    </button>
  </div>

  <div class="frame">
    <iframe bind:this={iframe} data-why {title} {src}>
      <slot />
    </iframe>
    {#if showCode}
      <div class="code">
        <pre>{source}</pre>
      </div>
    {/if}
  </div>
</div>

<style>
  .story {
    background-color: #303030;
  }

  .bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #444444;
    border-top-left-radius: 0.3rem;
    border-top-right-radius: 0.3rem;
    opacity: 0.8;
  }

  h2 {
    font-size: 1rem;
    font-weight: 500;
    margin: 0;
    margin-left: 0.5rem;
  }

  button {
    margin: 0;
    padding: 0.3rem 0.5rem;
    background-color: transparent;
    color: #efefef;
    font-size: 0.9rem;
    border: 0;
    cursor: pointer;
    border-top-right-radius: 0.3rem;
    transition: background-color 0.2s;
  }

  button:focus,
  button:hover,
  button[aria-pressed='true'] {
    background-color: #efefef20;
  }

  .frame {
    position: relative;
    overflow: hidden;
    border-bottom-left-radius: 0.3rem;
    border-bottom-right-radius: 0.3rem;
  }

  iframe {
    display: block;
    margin: 0;
    border: 0;
    background-color: transparent;
    border-radius: 0;
    width: 100%;
    height: 167px;
  }

  .code {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0 0.5rem;
    background-color: #1e1e1e;
    overflow: auto;
    text-align: left;
  }
</style>
