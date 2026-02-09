<script setup>
import { ref, computed } from 'vue'
import { createCancelToken, createCaptureToken, processPaymentToken } from '../../api/api.js'
import { useDialogs } from '../../composables/core/useDialogs.js'
import { useNotifications } from '../../composables/core/useNotifications.js'
import {
  PAYMENT_WAITING,
  PAYMENT_AUTHORIZED,
} from '../../shared/constants.js'

const props = defineProps({
  reservation: {
    type: Object,
    required: true,
  },
  payment: {
    type: Object,
    required: true,
  }
})

const emit = defineEmits(['updated'])

// Композаблы
const { confirm: showConfirm } = useDialogs()
const { success, error } = useNotifications()

const t = {
  paymentSuccess: window.wp.i18n.__('Payment %s successfully', 'bookiflex'),
  failedToAction: window.wp.i18n.__('Failed to %s payment', 'bookiflex'),
  cancelMessage: window.wp.i18n.__('Cancel this pending payment. It will no longer be available for completion by the guest.', 'bookiflex'),
  cancelPayment: window.wp.i18n.__('Cancel Payment', 'bookiflex'),
  keepPayment: window.wp.i18n.__('Keep Payment', 'bookiflex'),
  captureMessage: window.wp.i18n.__('Capture the authorized payment amount. The funds will be transferred according to the payment provider\'s rules.', 'bookiflex'),
  capturePayment: window.wp.i18n.__('Capture Payment', 'bookiflex'),
  captureFunds: window.wp.i18n.__('Capture Funds', 'bookiflex'),
  cancel: window.wp.i18n.__('Cancel', 'bookiflex'),
  capture: window.wp.i18n.__('Capture', 'bookiflex'),
}

// Константы действий
const CAPTURE_ACTION = 'capture'
const CANCEL_ACTION = 'cancel'

// Состояние
const processingAction = ref(null)
const disabled = ref(false)

// Вычисляемые свойства для отображения кнопок
const isShowCancelButton = computed(() => {
  return [
    PAYMENT_WAITING,
    PAYMENT_AUTHORIZED,
  ].includes(props.payment.status)
})

const isShowCaptureButton = computed(() => {
  return [PAYMENT_AUTHORIZED].includes(props.payment.status)
    || (props.payment.gatewayName === 'offline' && [PAYMENT_WAITING].includes(props.payment.status))
})

/**
 * Обработка действия с платежом
 */
const processAction = async (action) => {
  processingAction.value = action
  disabled.value = true

  try {
    const result = await getTokenByAction(action)

    if (result?.token) {
      await processPaymentToken(result.token)
      await refreshPage()

      // Показываем уведомление об успехе
      const actionMessage = action === CAPTURE_ACTION ? 'captured' : 'cancelled'
      success(window.wp.i18n.sprintf(t.paymentSuccess, actionMessage))
    }
  } catch (err) {
    console.error('Payment processing error:', err)
    error(window.wp.i18n.sprintf(t.failedToAction, action), {
      duration: 8000
    })
  } finally {
    processingAction.value = null
    disabled.value = false
  }
}

/**
 * Получение токена для действия
 */
const getTokenByAction = async (action) => {
  const tokenCreators = {
    [CAPTURE_ACTION]: createCaptureToken,
    [CANCEL_ACTION]: createCancelToken
  }

  const createToken = tokenCreators[action]
  if (!createToken) {
    throw new Error(`Unknown action: ${action}`)
  }

  return await createToken(props.payment.id, props.reservation.sid)
}

/**
 * Обновление страницы и данных
 */
const refreshPage = async () => {
  emit('updated', { reservationId: props.reservation.id })

  // Обновляем турбо фрейм если доступен
  if (window.Turbo) {
    window.Turbo.visit(window.location.href, { frame: 'bflex-custom-tables' })
  }
}

/**
 * Обработчик отмены платежа
 */
const onCancel = async () => {
  const confirmed = await showConfirm(
      t.cancelMessage,
      {
        title: t.cancelPayment,
        variant: 'danger',
        confirmText: t.cancelPayment,
        cancelText: t.keepPayment
      }
  )

  if (confirmed) {
    await processAction(CANCEL_ACTION)
  }
}

/**
 * Обработчик захвата платежа
 */
const onCapture = async () => {
  const confirmed = await showConfirm(
      t.captureMessage,
      {
        title: t.capturePayment,
        variant: 'success',
        confirmText: t.captureFunds,
        cancelText: t.cancel
      }
  )

  if (confirmed) {
    await processAction(CAPTURE_ACTION)
  }
}
</script>

<template>
  <div class="payment-actions" style="margin-top: 12px">
    <sl-button
        v-if="isShowCaptureButton"
        @click="onCapture"
        :loading="processingAction === CAPTURE_ACTION"
        :disabled="disabled"
        variant="success"
        size="small"
    >
      {{ t.capture }}
    </sl-button>

    <sl-button
        v-if="isShowCancelButton"
        @click="onCancel"
        :loading="processingAction === CANCEL_ACTION"
        :disabled="disabled"
        variant="danger"
        outline
        size="small"
    >
      <sl-icon slot="prefix" name="x-circle"></sl-icon>
      {{ t.cancel }}
    </sl-button>

    <slot></slot>
  </div>
</template>

<style scoped lang="scss"></style>