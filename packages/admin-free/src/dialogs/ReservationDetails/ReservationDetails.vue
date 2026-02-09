<script setup>
import { onMounted } from 'vue'
import {
  useReservation,
  useGlobalDrawerNavigation,
  BaseDrawer,
  GuestInformation,
  FinancialSummary,
  PaymentLineCard,
  ReservationDetails,
  ReservationStatusManager,
  ReservationStatus,
  PenaltyStatus,
  reloadFrame,
  RESERVATION_CANCELLED
} from '@bookiflex/admin-core'

const t = {
  loading: window.wp.i18n.__('Loading...', 'bookiflex'),
  specialRequest: window.wp.i18n.__('Special request', 'bookiflex'),
  payments: window.wp.i18n.__('Payments', 'bookiflex'),
  noPaymentsFound: window.wp.i18n.__('No payments found.', 'bookiflex'),
  loadingReservationDetails: window.wp.i18n.__('Loading reservation details...', 'bookiflex'),
  errorLoadingReservation: window.wp.i18n.__('Error loading reservation', 'bookiflex')
}

const props = defineProps({
  /**
   * ID резервации для загрузки
   */
  reservationId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['close'])

// Композаблы
const {
  reservation,
  totals,
  isLoading,
  error,
  load: loadReservation,
  reload: reloadReservation,
  isCancelled
} = useReservation()

const { navigateTo } = useGlobalDrawerNavigation()

/**
 * Обработчик действий с платежами
 */
const handlePaymentAction = async ({ type, id }) => {
  if (type === 'details') {
    // Навигация к деталям платежа
    await navigateTo({
      component: 'PaymentDetails',
      props: { paymentId: id },
      addToStack: true
    })
  } else if (type === 'updated') {
    // Перезагрузка после обновления
    await reloadReservation()
    reloadFrame()
  }
}

/**
 * Обработчик действий со штрафом
 */
const handlePenaltyResolved = async () => {
  await reloadReservation()
}

/**
 * Показать детали стоимости резервации
 */
const showCostDetails = async () => {
  if (!reservation.value) return

  await navigateTo({
    component: 'FinancialSummaryDetails',
    props: {
      number: reservation.value.number,
      totals: totals.value
    },
    addToStack: true
  })
}

/**
 * Обработчик обновления статуса резервации
 */
const handleStatusUpdate = async () => {
  await reloadReservation()
  reloadFrame()
}

/**
 * Обработчик возврата из вложенного drawer
 */
const handleBack = () => {
  // Логика возврата обрабатывается в BaseDrawer и навигационном менеджере
  emit('close')
}

/**
 * Обработчик закрытия drawer
 */
const handleClose = () => {
  emit('close')
}

// Загрузка данных при монтировании
onMounted(async () => {
  await loadReservation(props.reservationId)
})
</script>

<template>
  <BaseDrawer
      :auto-show="true"
      @close="handleClose"
      @back="handleBack"
  >
    <!-- Заголовок с номером резервации и статусом -->
    <template #label>
      <div style="display: flex; align-items: center; justify-content: center; gap:5px;">
        <template v-if="reservation">
          {{ reservation.number }}
          <ReservationStatus :status="reservation.status" />
        </template>
        <template v-else-if="isLoading">
          {{ t.loading }}
        </template>
      </div>
    </template>

    <!-- Основной контент -->
    <template v-if="reservation">
      <!-- Информация о госте -->
      <GuestInformation :customer="reservation.customer">
        <div class="guest-request" v-if="reservation.specialRequest">
          <div class="info-item">
            <div class="info-label">{{ t.specialRequest }}</div>
            <div class="info-value">{{ reservation.specialRequest }}</div>
          </div>
        </div>
      </GuestInformation>

      <!-- Детали резервации -->
      <ReservationDetails :reservation="reservation">
        <ReservationStatusManager
            style="margin-top: 12px"
            :reservation="reservation"
            @updated="handleStatusUpdate"
        />
      </ReservationDetails>

      <!-- Секция платежей -->
      <div class="section payment-section">
        <div class="section-title">{{ t.payments }}</div>
        <div v-if="!reservation.payment.transactions.length">
          {{ t.noPaymentsFound }}
        </div>
        <PaymentLineCard
            v-for="transaction in reservation.payment.transactions"
            :key="transaction.id"
            :transaction="transaction"
            :reservation="reservation"
            @actionClick="handlePaymentAction"
        />
      </div>

      <!-- Финансовая сводка -->
      <FinancialSummary
          :isCancelled="isCancelled"
          :payment="reservation.payment"
          :penalties="reservation.cancellation.penalties"
          :total="totals.total"
          :currency="totals.currency"
          @actionClick="showCostDetails"
      >
        <template v-if="reservation.status === RESERVATION_CANCELLED">
          <PenaltyStatus
              v-for="penalty in reservation.cancellation.penalties"
              :currency="totals.currency"
              :prepaid-amount="reservation.payment.amounts.paid"
              :penalty="penalty"
              @resolved="handlePenaltyResolved"
          />
        </template>
      </FinancialSummary>
    </template>

    <!-- Состояние загрузки -->
    <template v-else-if="isLoading">
      <div class="loading-state">
        <sl-spinner></sl-spinner>
        <p>{{ t.loadingReservationDetails }}</p>
      </div>
    </template>

    <!-- Состояние ошибки -->
    <template v-else-if="error">
      <div class="error-state">
        <sl-alert type="danger" open>
          <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
          <strong>{{ t.errorLoadingReservation }}</strong><br>
          {{ error.message }}
        </sl-alert>
      </div>
    </template>
  </BaseDrawer>
</template>

<style lang="scss"></style>