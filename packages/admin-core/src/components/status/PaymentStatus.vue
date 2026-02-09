<script setup>
import { computed } from 'vue'
import { PAYMENT_WAITING, PAYMENT_PAID, PAYMENT_CANCELLED, PAYMENT_AUTHORIZED, PAYMENT_EXPIRED } from '../../shared/constants.js'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

const t = {
  paid: window.wp.i18n.__('Paid', 'bookiflex'),
  waiting: window.wp.i18n.__('Waiting', 'bookiflex'),
  authorized: window.wp.i18n.__('Authorized', 'bookiflex'),
  cancelled: window.wp.i18n.__('Cancelled', 'bookiflex'),
  expired: window.wp.i18n.__('Expired', 'bookiflex'),
}

const statusObj = computed(() => {
  switch (props.status) {
    case PAYMENT_PAID:
      return {
        label: t.paid,
        variant: 'success',
      }
    case PAYMENT_WAITING:
      return {
        label: t.waiting,
        variant: 'warning',
      }
    case PAYMENT_AUTHORIZED:
      return {
        label: t.authorized,
        variant: 'primary',
      }
    case PAYMENT_CANCELLED:
      return {
        label: t.cancelled,
        variant: 'danger',
      }
    case PAYMENT_EXPIRED:
      return {
        label: t.expired,
        variant: 'neutral',
      }
    default:
      return null
  }
})
</script>

<template>
  <sl-badge v-if="statusObj" :variant="statusObj.variant">
    {{ statusObj.label }}
  </sl-badge>
</template>

<style scoped lang="scss"></style>
