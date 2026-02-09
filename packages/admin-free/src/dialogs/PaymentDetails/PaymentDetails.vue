<script setup>
import { onMounted } from 'vue'
import {
  usePayment,
  BaseDrawer,
  GuestInformation,
  formatMoney,
  ReservationStatus,
  PaymentStatus,
  PaymentStatusManager,
  reloadFrame
} from '@bookiflex/admin-core'

const t = {
  paymentDetails: window.wp.i18n.__('Payment details', 'bookiflex'),
  generalInformation: window.wp.i18n.__('General information', 'bookiflex'),
  number: window.wp.i18n.__('Number', 'bookiflex'),
  createdAt: window.wp.i18n.__('Created at', 'bookiflex'),
  amount: window.wp.i18n.__('Amount', 'bookiflex'),
  gatewayName: window.wp.i18n.__('Gateway name', 'bookiflex'),
  allocations: window.wp.i18n.__('Allocations', 'bookiflex'),
  paymentGatewayResponse: window.wp.i18n.__('Payment gateway response', 'bookiflex'),
  loadingPaymentDetails: window.wp.i18n.__('Loading payment details...', 'bookiflex'),
  errorLoadingPayment: window.wp.i18n.__('Error loading payment', 'bookiflex')
}

const props = defineProps({
  /**
   * ID платежа для загрузки
   */
  paymentId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['close', 'back'])

// Композабл для работы с платежами
const {
  payment,
  isLoading,
  error,
  load: loadPayment,
  reload: reloadPayment,
  getRelatedReservation,
  hasAllocations,
  hasGatewayDetails
} = usePayment()

/**
 * Обработчик обновления платежа
 */
const handlePaymentUpdate = async () => {
  await reloadPayment()
  reloadFrame()
}

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

// Загрузка данных при монтировании
onMounted(async () => {
  await loadPayment(props.paymentId)
})
</script>

<template>
  <BaseDrawer
      :auto-show="true"
      :show-back="true"
      @close="handleClose"
      @back="handleBack"
  >
    <!-- Заголовок с деталями платежа -->
    <template #label>
      <div style="display: flex; align-items: center; justify-content: center; gap:5px;">
        {{ t.paymentDetails }}
        <PaymentStatus v-if="payment" :status="payment.status" />
      </div>
    </template>

    <!-- Основной контент -->
    <template v-if="payment">
      <!-- Информация о клиенте -->
      <GuestInformation :customer="payment.client" />

      <!-- Общая информация -->
      <div class="section">
        <div class="section-title">{{ t.generalInformation }}</div>
        <div class="payment-details-info">
          <div class="info-item">
            <div class="info-label">{{ t.number }}</div>
            <div class="info-value">{{ payment.number }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ t.createdAt }}</div>
            <div class="info-value">{{ payment.createdAt }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ t.amount }}</div>
            <div class="info-value">
              {{ formatMoney(payment.amount, payment.currency) }}
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">{{ t.gatewayName }}</div>
            <div class="info-value">{{ payment.gatewayName }}</div>
          </div>
        </div>

        <!-- Управление статусом платежа -->
        <PaymentStatusManager
            :payment="payment"
            :reservation="getRelatedReservation"
            @updated="handlePaymentUpdate"
        />
      </div>

      <!-- Allocations -->
      <div class="section" v-if="hasAllocations">
        <div class="section-title">{{ t.allocations }}</div>
        <sl-card
            class="allocation-item"
            v-for="(allocation, idx) in payment.allocations"
            :key="idx"
        >
          <div class="allocation-content">
            <div class="allocation-header">
              <div class="allocation-info">
                <div class="allocation-amount">
                  {{ formatMoney(allocation.amount, payment.currency) }}
                </div>
                <div class="allocation-source">{{ allocation.reservation.number }}</div>
              </div>
              <ReservationStatus :status="allocation.reservation.status" />
            </div>
          </div>
        </sl-card>
      </div>

      <!-- Детали от платежного шлюза -->
      <div v-if="hasGatewayDetails" class="section">
        <div class="section-title">{{ t.paymentGatewayResponse }}</div>
        <div class="card-block">
          <section class="bg--grey">
            <pre style="overflow: auto">{{ JSON.stringify(payment.details, null, 2) }}</pre>
          </section>
        </div>
      </div>
    </template>

    <!-- Состояние загрузки -->
    <template v-else-if="isLoading">
      <div class="loading-state">
        <sl-spinner></sl-spinner>
        <p>{{ t.loadingPaymentDetails }}</p>
      </div>
    </template>

    <!-- Состояние ошибки -->
    <template v-else-if="error">
      <div class="error-state">
        <sl-alert type="danger" open>
          <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
          <strong>{{ t.errorLoadingPayment }}</strong><br>
          {{ error.message }}
        </sl-alert>
      </div>
    </template>
  </BaseDrawer>
</template>

<style scoped lang="scss"></style>