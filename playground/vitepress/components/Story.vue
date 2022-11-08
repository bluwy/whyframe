<script setup>
import { computed, ref } from 'vue'
import { getWhyframeSource } from '@whyframe/core/utils'

defineProps({
  title: {
    type: String,
    required: true
  },
  src: {
    type: String,
    default: '/frames/special.html'
  }
})

const iframe = ref()
const source = computed(() => {
  return iframe.value ? getWhyframeSource(iframe.value) : undefined
})

const showCode = ref(false)
</script>

<template>
  <div class="story">
    <div class="bar">
      <h2>{{ title }}</h2>
      <button aria-pressed="showCode" @click="showCode = !showCode">
        Show code
      </button>
    </div>

    <div class="frame">
      <iframe ref="iframe" data-why :title="title" :src="src">
        <slot />
      </iframe>
      <div v-show="showCode" class="code">
        <pre>{{ source }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  padding-top: 0;
  color: #efefef;
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
  height: 161px;
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
  font-size: 0.8rem;
}
</style>
