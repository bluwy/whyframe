<script setup>
import whyframe from '@/assets/logo.svg'
import vue from '@/assets/vue.svg'
</script>

<template>
  <iframe data-why title="Package demo">
    <p>
      <img :src="whyframe" alt="whyframe" height="80" />
      <span>+</span>
      <img :src="vue" alt="vue" height="56" />
    </p>
  </iframe>
</template>

<style scoped>
iframe {
  width: 100%;
  border: 0;
  height: 150px;
}

p {
  display: flex;
  justify-content: center;
  align-items: center;
}

span {
  font-size: 3rem;
  margin: 0 0.8rem;
  font-weight: 300;
}
</style>
