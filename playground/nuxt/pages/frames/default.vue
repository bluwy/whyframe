<script setup>
import { ref, onMounted } from 'vue'
import { createApp } from 'whyframe:app'

definePageMeta({
  layout: 'empty'
})

useHead({
  title: 'Whyframe - Default'
})

const el = ref()

onMounted(() => {
  createApp(el.value)
})
</script>

<template>
  <div ref="el"></div>
</template>

<style scoped>
div {
  background-color: black;
  padding: 0.5rem;
  margin: 0;
  width: 100%;
  height: 100vh;
}
</style>
