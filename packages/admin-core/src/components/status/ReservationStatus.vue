<script setup>
import { computed } from 'vue'
import {
  RESERVATION_WAITING_PAYMENT,
  RESERVATION_CONFIRMED,
  RESERVATION_OVERDUE,
  RESERVATION_WAITING_CONFIRMATION,
  RESERVATION_CANCELLED, RESERVATION_IN_HOUSE, RESERVATION_COMPLETED, RESERVATION_NO_SHOW,
} from '../../shared/constants.js'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

const t = {
  waitingForPayment: window.wp.i18n.__('Waiting for payment', 'bookiflex'),
  needConfirmation: window.wp.i18n.__('Need confirmation', 'bookiflex'),
  inHouse: window.wp.i18n.__('In house', 'bookiflex'),
  confirmed: window.wp.i18n.__('Confirmed', 'bookiflex'),
  completed: window.wp.i18n.__('Completed', 'bookiflex'),
  noShow: window.wp.i18n.__('No Show', 'bookiflex'),
  cancelled: window.wp.i18n.__('Cancelled', 'bookiflex'),
  overdue: window.wp.i18n.__('Overdue', 'bookiflex'),
}

const statusObj = computed(() => {
  switch (props.status) {
    case RESERVATION_WAITING_PAYMENT:
      return {
        label: t.waitingForPayment,
        variant: 'warning',
      }
    case RESERVATION_WAITING_CONFIRMATION:
      return {
        label: t.needConfirmation,
        variant: 'primary',
      }
    case RESERVATION_IN_HOUSE:
      return {
        label: t.inHouse,
        variant: 'primary',
      }
    case RESERVATION_CONFIRMED:
      return {
        label: t.confirmed,
        variant: 'success',
      }
    case RESERVATION_COMPLETED:
      return {
        label: t.completed,
        variant: 'neutral',
      }
    case RESERVATION_NO_SHOW:
      return {
        label: t.noShow,
        variant: 'danger',
      }
    case RESERVATION_CANCELLED:
      return {
        label: t.cancelled,
        variant: 'danger',
      }
    case RESERVATION_OVERDUE:
      return {
        label: t.overdue,
        variant: 'danger',
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
