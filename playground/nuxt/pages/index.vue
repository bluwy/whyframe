<script setup>
const max = 10

function warn() {
  // NOTE: will affect callee's iframe, not this parent document
  console.log('warn!')
}
</script>

<template>
  <h1>Nuxt</h1>

  <iframe data-why title="Hello">
    <p>Click to increment!</p>
    <Counter />
  </iframe>

  <iframe data-why title="World" src="/frames/basic">
    <p>Do not go over {{ max }}</p>
    <Counter :max="max" @max="warn" />
  </iframe>

  <Story title="Foo">
    <p>Click to increment!</p>
    <Counter />
  </Story>

  <Story title="Bar" src="/frames/basic">
    <p>Do not go over {{ max }}</p>
    <Counter :max="max" @max="warn" />
  </Story>
</template>
