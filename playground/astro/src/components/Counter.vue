<script setup>
import { ref } from 'vue'

const props = defineProps({
  max: {
    type: Number,
    default: 0
  }
})
const emit = defineEmits(['max'])

const count = ref(0)

console.log(props)

const increment = () => {
  if (props.max !== 0 && count.value >= props.max) {
    emit('max')
    document.body.style.backgroundColor = 'pink'
    alert('🚨 YOU HAVE BEEN WARNED 🚨')
    return
  }
  count.value++
}
</script>

<template>
  <button @click="increment">Count is {{ count }} (vue)</button>
</template>

<style scoped>
button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.25s;
}

button:hover {
  background-color: #ced1ff;
  border-color: #646cff;
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}
</style>
