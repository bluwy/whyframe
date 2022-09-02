<script>
  import Popup from './Popup.svelte'
  const content = 'Hoozah!'
</script>

<h2>This is a popup component</h2>
<p>It opens a fullscreen overlay ...</p>

<iframe data-why>
  <Popup {content}>Open</Popup>
</iframe>

<p>... contained within the iframe!</p>

<style>
  iframe {
    border: none;
    border-radius: 0.5rem;
    width: 100%;
    height: 180px;
    border: 2px dashed var(--light);
  }

  h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
    opacity: 0.7;
  }
  p {
    margin: 0.5rem 0 0.8rem;
    font-size: 0.95rem;
    opacity: 0.7;
  }

  p:last-child {
    margin-top: 0.5rem;
    margin-bottom: 0;
  }
</style>
