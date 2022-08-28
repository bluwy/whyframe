<template>
  <iframe data-why title="Package demo">
    <p>
      <img src="@/assets/logo.svg" alt="whyframe" height="80" />
      <span>+</span>
      <img src="@/assets/vue.svg" alt="vue" height="56" />
    </p>
  </iframe>
</template>

<style scoped>
iframe {
  width: 100%;
  border: 0;
  height: 150px;
  border-radius: 0.5rem;
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
