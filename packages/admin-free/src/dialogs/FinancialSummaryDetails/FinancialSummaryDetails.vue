<script setup>
import { computed } from 'vue'
import {
  BaseDrawer,
  useBookingStyleSummary,
  formatMoney
} from '@bookiflex/admin-core'

const t = {
  night: window.wp.i18n.__('Night', 'bookiflex'),
  roomRate: window.wp.i18n.__('Room rate', 'bookiflex'),
  subtotal: window.wp.i18n.__('Subtotal', 'bookiflex'),
  additionalFees: window.wp.i18n.__('Additional fees', 'bookiflex'),
  total: window.wp.i18n.__('TOTAL', 'bookiflex')
}

const props = defineProps({
  /**
   * Общие суммы и разбивка
   */
  totals: {
    type: Object,
    required: true
  },

  /**
   * Номер резервации для заголовка
   */
  number: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'back'])

// Композабл для обработки финансовой сводки
const {
  nightsBreakdown,
  reservationModifiers,
  grandTotal
} = useBookingStyleSummary(computed(() => props.totals))

/**
 * Обработчик закрытия drawer
 */
const handleClose = () => {
  emit('close')
}

/**
 * Обработчик кнопки "Назад"
 */
const handleBack = () => {
  emit('back')
}
</script>

<template>
  <BaseDrawer
      :auto-show="true"
      :show-back="true"
      @close="handleClose"
      @back="handleBack"
  >
    <!-- Заголовок с номером резервации -->
    <template #label>
      <div style="display: flex; align-items: center; justify-content: center; gap:5px;">
        {{ number }}
      </div>
    </template>

    <!-- Детальная разбивка стоимости -->
    <div class="reservation-summary">
      <!-- Разбивка по ночам -->
      <div
          v-for="(night, index) in nightsBreakdown"
          :key="night.date"
          class="section night-breakdown"
      >
        <h4>{{ t.night }} {{ index + 1 }} ({{ night.date }}):</h4>

        <!-- Базовая стоимость -->
        <div class="price-line">
          <span>{{ t.roomRate }}:</span>
          <span></span>
          <span>{{ night.basePriceFormatted }}</span>
        </div>

        <!-- Налоги -->
        <div
            v-for="tax in night.modifiers.taxes"
            :key="tax.code"
            class="price-line modifier"
        >
          <span>
            + {{ tax.name }}
            {{ tax.percentage ? `(${tax.percentage}%)` : '' }}:
          </span>
          <span>{{ formatMoney(tax.amount, totals.currency) }}</span>
        </div>

        <!-- Дополнительные сборы -->
        <div
            v-for="charge in night.modifiers.charges"
            :key="charge.code"
            class="price-line modifier"
        >
          <span>+ {{ charge.name }}:</span>
          <span>{{ formatMoney(charge.amount, totals.currency) }}</span>
        </div>

        <!-- Подитог за ночь -->
        <div class="subtotal">
          <span>{{ t.subtotal }}:</span>
          <span>{{ night.totalFormatted }}</span>
        </div>
      </div>

      <!-- Дополнительные сборы на уровне резервации -->
      <div v-if="reservationModifiers.charges.length" class="section charges-section">
        <h4>{{ t.additionalFees }}:</h4>
        <div
            v-for="charge in reservationModifiers.charges"
            :key="charge.code"
            class="price-line"
        >
          <span>{{ charge.name }}:</span>
          <span>{{ charge.formatted }}</span>
        </div>
      </div>

      <!-- Общая сумма -->
      <div class="section total-section">
        <strong>{{ t.total }}: {{ grandTotal.formatted }}</strong>
      </div>
    </div>
  </BaseDrawer>
</template>

<style scoped lang="scss"></style>