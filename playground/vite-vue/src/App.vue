<script setup>
import Counter from './Counter.vue'
import Story from './Story.vue'

const max = 10

function warn() {
  // NOTE: will affect callee's iframe, not this parent document.
  // TODO: does it make sense to be the latter?
  document.body.style.backgroundColor = 'yellow'
}
</script>

<template>
  <h1>Vue</h1>

  <iframe data-why title="Hello">
    <p>Click to increment!</p>
    <Counter />
  </iframe>

  <iframe data-why title="World" src="/frames/basic/index.html">
    <p>Do not go over {{ max }}</p>
    <Counter :max="max" @max="warn" />
  </iframe>

  <Story title="Foo">
    <p>Click to increment!</p>
    <Counter />
  </Story>

  <Story title="Bar" src="/frames/basic/index.html">
    <p>Do not go over {{ max }}</p>
    <Counter :max="max" @max="warn" />
  </Story>
</template>
