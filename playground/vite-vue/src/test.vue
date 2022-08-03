<template>

    <p>Click to increment!</p>
   <Counter :max="max" @max="warn" />
  
</template>
<script setup>
import Counter from './Counter.vue'

const max = 10

function warn() {
  console.log('as')
  // NOTE: will affect callee's iframe, not this parent document.
  // TODO: does it make sense to be the latter?
  document.body.style.backgroundColor = 'yellow'
}
</script>