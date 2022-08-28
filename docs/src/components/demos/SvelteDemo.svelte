<script>
  import whyframe from '@/assets/logo.svg'
  import svelte from '@/assets/svelte.svg'
</script>

<iframe data-why title="Package demo">
  <p>
    <img src={whyframe} alt="whyframe" height="80" />
    <span>+</span>
    <img src={svelte} alt="svelte" height="70" />
  </p>
</iframe>

<style>
  iframe {
    width: 100%;
    border: 0;
    height: 150px;
    border-radius: 0.5rem;
  }

  p {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  span {
    font-size: 3rem;
    margin: 0 0.8rem;
    font-weight: 300;
  }
</style>
