<script setup>
defineProps({
  request: {
    type: String,
    default: '',
  },
})

const t = {
  specialRequest: window.wp.i18n.__('Special request', 'bookiflex'),
}
</script>

<template>
  <div class="card-block">
    <header class="header--small">{{ t.specialRequest }}</header>
    <section class="bg--antiquewhite">
      <p>{{ request }}</p>
    </section>
  </div>
</template>

<style scoped lang="scss"></style>
