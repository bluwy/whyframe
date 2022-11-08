<script setup>
import Popup from './components/Popup.vue'
import Story from './components/Story.vue'
</script>

<div>
  <a href="https://vitepress.vuejs.org" target="_blank">
    <img src="./assets/vue.svg" class="logo vue" alt="vue" height="80" />
  </a>
  <a href="https://whyframe.dev" target="_blank">
    <img
      src="./assets/whyframe.svg"
      class="logo whyframe"
      alt="whyframe"
      height="80"
    />
  </a>
</div>

# VitePress + Whyframe

Check out the examples below to see component isolation in action!

You can view the source code at `index.md`.

Click on the logos above to learn more.

<iframe data-why title="Popup 1" src="/frames/default.html">
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

<style scoped>
.logo {
  display: inline-block;
  height: 80px;
  margin: 1.5rem;
  will-change: filter;
  transition: filter 0.15s ease-out;
}
.logo.vite:hover {
  filter: drop-shadow(0 0 2rem #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
.logo.whyframe:hover {
  filter: drop-shadow(0 0 2rem #ffed24aa);
}
</style>
