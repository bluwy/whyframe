<script>
  import svelteLogo from './assets/svelte.svg'
  import whyframeLogo from './assets/whyframe.svg'
  import Story from './components/Story.svelte'
  import Popup from './components/Popup.svelte'
</script>

<main>
  <div>
    <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
      <img src="/vite.svg" class="logo vite" alt="vite" height="80" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="svelte" height="80" />
    </a>
    <a href="https://whyframe.dev" target="_blank" rel="noreferrer">
      <img
        src={whyframeLogo}
        class="logo whyframe"
        alt="whyframe"
        height="80"
      />
    </a>
  </div>

  <h1>Vite + Svelte + Whyframe</h1>

  <p class="docs">
    Check out the examples below to see component isolation in action!
    <br />
    You can view the source code at <code>src/App.svelte</code>.
    <br />
    Click on the logos above to learn more.
  </p>

  <div class="frames">
    <iframe data-why title="Popup 1">
      <p>Simple usage example</p>
      <Popup content="Hello world">Open popup</Popup>
    </iframe>

    <iframe data-why title="Popup 2" src="/frames/special.html">
      <p>Custom HTML source</p>
      <Popup content="Hello world">Open popup</Popup>
    </iframe>

    <iframe
      data-why
      data-why-show-source
      title="Popup 3"
      src="/frames/special.html"
    >
      <p>Inspect this iframe to view the raw source</p>
      <Popup content="Hello world">Open popup</Popup>
    </iframe>

    <Story title="Popup 4">
      <p>This is a Story component</p>
      <Popup content="Hello world">Open popup</Popup>
    </Story>
  </div>
</main>

<style>
  .logo {
    margin: 1.5rem;
    will-change: filter;
    transition: filter 0.15s ease-out;
  }
  .logo.vite:hover {
    filter: drop-shadow(0 0 2rem #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2rem #ff3e00aa);
  }
  .logo.whyframe:hover {
    filter: drop-shadow(0 0 2rem #ffed24aa);
  }

  .docs {
    line-height: 2;
    opacity: 0.7;
  }

  .frames {
    max-width: 900px;
    margin: 2rem auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
</style>
