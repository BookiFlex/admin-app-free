<script setup>
defineProps({
  customer: {
    type: Object,
    required: true,
  }
})

const t = {
  guestInformation: window.wp.i18n.__('Guest information', 'bookiflex'),
  person: window.wp.i18n.__('Person', 'bookiflex'),
  email: window.wp.i18n.__('Email', 'bookiflex'),
  phone: window.wp.i18n.__('Phone', 'bookiflex'),
}
</script>

<template>
  <div class="section">
    <div class="section-title">{{ t.guestInformation }}</div>
    <div class="guest-info">
      <div class="info-item">
        <div class="info-label">{{ t.person }}</div>
        <div class="info-value">{{ customer.firstName }} {{ customer.lastName }}</div>
      </div>
      <div class="info-item">
        <div class="info-label">{{ t.email }}</div>
        <div class="info-value">{{ customer.email }}</div>
      </div>
      <div class="info-item">
        <div class="info-label">{{ t.phone }}</div>
        <div class="info-value">{{ customer.phone || '-' }}</div>
      </div>
    </div>

    <slot></slot>
  </div>
</template>

<style scoped lang="scss"></style>
