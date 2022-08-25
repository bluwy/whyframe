<script setup>
defineProps(['title', 'src'])
</script>

<template>
  <div>
    <p>This is a story of {{ title }}:</p>

    <iframe data-why :title="title" :src="src || $attrs._why?.src">
      <slot />
    </iframe>
  </div>
</template>
