<script setup>
import { getWhyframeSource } from '@whyframe/core/utils'
import { computed, ref } from 'vue'

defineProps(['title', 'src'])

const iframe = ref()
const source = computed(() => {
  return iframe.value ? getWhyframeSource(iframe.value) : undefined
})
</script>

<template>
  <div>
    <p>This is a story of {{ title }}:</p>

    <iframe ref="iframe" data-why :title="title" :src="src">
      <slot />
    </iframe>

    <details>
      <summary>source</summary>
      <pre>{{ source }}</pre>
    </details>
  </div>
</template>
