<script setup>
import Counter from './Counter.vue'

const max = 10

function warn() {
  // NOTE: will affect callee's iframe, not this parent document.
  // TODO: does it make sense to be the latter?
  document.body.style.backgroundColor = 'yellow'
}
</script>

<template>
  <h1>whyframe</h1>

  <iframe why title="Hello">
    <p>Click to increment!</p>
    <Counter />
  </iframe>

  <iframe why title="World" why-template="basic">
    <p>Do not go over {{ max }}</p>
    <Counter :max="max" @max="warn" />
  </iframe>
</template>
