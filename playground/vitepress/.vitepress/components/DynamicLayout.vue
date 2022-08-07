<script setup>
import { useRoute } from 'vitepress'
import Theme from 'vitepress/theme'
import FrameBasicLayout from './FrameBasicLayout.vue'

const route = useRoute()
</script>

<template>
  <FrameBasicLayout v-if="route.path.startsWith('/frames/basic')" />
  <Theme.Layout v-else />
</template>
