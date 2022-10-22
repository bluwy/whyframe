<template>
  <iframe :src="$attrs._why?.src || $props._why?.src ||&quot;/__whyframe.html&quot;" :data-why-id="$attrs._why?.id || $props._why?.id " :data-why-source="$attrs._why?.source || $props._why?.source " data-why></iframe>
</template>
