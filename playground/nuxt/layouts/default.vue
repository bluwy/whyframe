<template>
  <div id="app">
    <slot />
  </div>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  background-color: #1e1e1e;
  color: #efefef;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}

#app {
  padding: 1rem;
  text-align: center;
}

iframe[data-why],
.story {
  display: inline-block;
  border: 3px solid #303030;
  background-color: #a2a2a2;
  border-radius: 0.5rem;
  width: 400px;
  height: 200px;
}
</style>
