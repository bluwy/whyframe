<script setup>
defineProps(['title', 'whyframeSrc'])
</script>

<template>
  <div>
    <p>This is a story of {{ title }}:</p>

    <iframe data-why :title="title">
      <slot />
    </iframe>
  </div>
</template>
