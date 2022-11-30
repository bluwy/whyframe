<script setup>
import { ref } from 'vue'

defineProps({
  content: {
    type: String,
    required: true
  }
})

const open = ref(false)
</script>

<template>
  <button class="activator" aria-haspopup="dialog" @click="open = !open">
    <slot />
  </button>

  <button v-show="open" class="background" @click="open = false">
    <p>{{ content }}</p>
  </button>
</template>

<style scoped>
.activator {
  display: block;
  border-radius: 8px;
  border: 1px solid black;
  padding: 0.5em 1em;
  font-size: 0.9em;
  font-weight: 500;
  font-family: inherit;
  color: #1e1e1e;
  background-color: #efefef;
  cursor: pointer;
  transition: border-color 0.25s;
}

.dark .activator {
  border-color: transparent;
  color: #efefef;
  background-color: #1e1e1e;
}

.activator:hover {
  border-color: #ffed24;
}

.activator:focus,
.activator:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

.background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
  background-color: #090909;
  color: #efefef;
  font-size: 1.5rem;
  opacity: 0.8;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.background:focus,
.background:focus-visible {
  border: 4px solid #ffed24;
}
</style>
