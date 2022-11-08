---
layout: false
---

<script setup>
import { ref, onMounted } from 'vue'
import { createApp } from 'whyframe:app'
import { trackColorScheme } from './utils'

const el = ref()

onMounted(() => {
  trackColorScheme()
  createApp(el.value)
})
</script>

<!-- empty file to keep vitepress happy. see FrameDefaultLayout.vue -->
<div id="vp-app" ref="el"></div>

<style scoped>
#vp-app {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  width: 100%;
  height: 100vh;
  padding: 0.5rem;
}
</style>
