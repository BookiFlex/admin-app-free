<script setup>
import { computed } from 'vue'
import { formatMoney } from '../../shared/util.js'

const props = defineProps({
  payment: {
    type: Object,
    required: true,
  },
  penalties: {
    type: Array,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  isCancelled: {
    type: Boolean,
    required: true,
  }
})

const t = {
  financialSummary: window.wp.i18n.__('Financial summary', 'bookiflex'),
  total: window.wp.i18n.__('Total', 'bookiflex'),
  paid: window.wp.i18n.__('Paid', 'bookiflex'),
  penalty: window.wp.i18n.__('Penalty', 'bookiflex'),
  onArrival: window.wp.i18n.__('On arrival', 'bookiflex'),
}

const emit = defineEmits(['actionClick'])
const onDetailsEmit = () => {
  emit('actionClick')
}
const penaltyAmount = computed(() => {
  return props.penalties.reduce((acc, current) => {
    acc += current.amount
    return acc
  }, 0)
})
</script>

<template>
  <div class="section">
    <div class="section-title">{{ t.financialSummary }}</div>
    <sl-card class="financial-summary">
      <div class="financial-row">
        <span class="financial-label">{{ t.total }}</span>
        <span class="financial-value details-value" @click="onDetailsEmit">{{ formatMoney(total, currency) }}</span>
      </div>
      <div class="financial-row">
        <span class="financial-label">{{ t.paid }}</span>
        <span class="financial-value">{{ formatMoney(payment.amounts.paid, currency) }}</span>
      </div>
      <div class="financial-row" v-if="isCancelled">
        <span class="financial-label">{{ t.penalty }}</span>
        <span class="financial-value total-value">{{ formatMoney(penaltyAmount, currency) }}</span>
      </div>
      <div v-else class="financial-row">
        <span class="financial-label">{{ t.onArrival }}</span>
        <span class="financial-value total-value">{{ formatMoney(payment.amounts.onArrival, currency) }}</span>
      </div>
    </sl-card>
    <slot></slot>
  </div>
</template>

<style scoped lang="scss"></style>
