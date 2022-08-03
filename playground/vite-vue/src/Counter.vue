<script setup>
import { ref } from 'vue'

const props = defineProps({
  max: {
    type: Number,
    default: 10
  }
})
const emit = defineEmits(['max'])

const count = ref(0)

const increment = () => {
  if (props.max !== 0 && count.value >= props.max) {
    emit('max')
    document.body.style.backgroundColor = 'pink'
    alert('too many clicks')
    return
  }
  count.value++
}
</script>

<template>
  <button @click="increment">count is {{ count }}</button>
</template>
