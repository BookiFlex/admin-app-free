<script setup>
import { computed } from 'vue'
import { formatMoney } from '../../shared/util.js'
import PaymentStatus from '../status/PaymentStatus.vue'
import PaymentStatusManager from "../status/PaymentStatusManager.vue";

const props = defineProps({
  transaction: {
    type: Object,
    required: true,
  },
  reservation: {
    type: Object,
    required: true,
  }
})

const t = {
  details: window.wp.i18n.__('Details', 'bookiflex'),
}

const emit = defineEmits(['actionClick'])
const onPaymentActionEmit = (type, id) => {
  emit('actionClick', { type, id })
}
const gatewayName = computed(() => {
  if (!props.transaction.gatewayName) return '';

  const withSpaces = props.transaction.gatewayName.replace(/_/g, ' ');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
})
</script>

<template>
  <sl-card class="payment-item">
    <div class="payment-content">
      <div class="payment-header">
        <div class="payment-info">
          <div class="payment-amount">{{ formatMoney(transaction.amount, transaction.currency) }}</div>
          <div class="payment-method">{{ gatewayName }}</div>
        </div>
        <PaymentStatus :status="transaction.status"></PaymentStatus>
      </div>
      <PaymentStatusManager :payment="transaction" :reservation="reservation" @updated="() => onPaymentActionEmit('updated', transaction.id)">
        <sl-button
            variant="neutral"
            outline
            size="small"
            @click="() => onPaymentActionEmit('details', transaction.id)"
        >
          <sl-icon slot="prefix" name="eye"></sl-icon>
          {{ t.details }}</sl-button>
      </PaymentStatusManager>
    </div>
  </sl-card>
</template>

<style scoped lang="scss"></style>
