<script>
  import svelteKitLogo from '$lib/assets/svelte.svg'
  import whyframeLogo from '$lib/assets/whyframe.svg'
  import Story from '$lib/components/Story.svelte'
  import Popup from '$lib/components/Popup.svelte'
</script>

<svelte:head>
  <title>SvelteKit + Whyframe</title>
</svelte:head>

<main>
  <div>
    <a href="https://kit.svelte.dev" target="_blank" rel="noreferrer">
      <img
        src={svelteKitLogo}
        class="logo sveltekit"
        alt="sveltekit"
        height="80"
      />
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

  <h1>SvelteKit + Whyframe</h1>

  <p class="docs">
    Check out the examples below to see component isolation in action!
    <br />
    You can view the source code at <code>src/routes/(app)/+page.svelte</code>.
    <br />
    Click on the logos above to learn more.
  </p>

  <div class="frames">
    <iframe data-why title="Popup 1">
      <p>Simple usage example</p>
      <Popup content="Hello world">Open popup</Popup>
    </iframe>

    <iframe data-why title="Popup 2" src="/frames/special">
      <p>Custom HTML source</p>
      <Popup content="Hello world">Open popup</Popup>
    </iframe>

    <iframe data-why data-why-show-source title="Popup 3" src="/frames/special">
      <p>Inspect this iframe to view the raw source</p>
      <Popup content="Hello world">Open popup</Popup>
    </iframe>

    <Story title="Popup 4">
      <p>This is a Story component</p>
      <Popup content="Hello world">Open popup</Popup>
    </Story>
  </div>

  <p>
    Go to <a href="/markdown">/markdown</a> for a MDsveX example.
  </p>
</main>

<style>
  .logo {
    margin: 1.5rem;
    will-change: filter;
    transition: filter 0.15s ease-out;
  }
  .logo.sveltekit:hover {
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
