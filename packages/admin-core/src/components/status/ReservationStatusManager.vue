<script setup>
import { ref, computed } from 'vue'
import { changeStatus } from '../../api/api.js'
import { useDialogs } from '../../composables/core/useDialogs.js'
import { useNotifications } from '../../composables/core/useNotifications.js'
import {
  RESERVATION_WAITING_CONFIRMATION,
  RESERVATION_WAITING_PAYMENT,
  RESERVATION_OVERDUE,
  RESERVATION_CONFIRMED,
  RESERVATION_CANCELLED,
  RESERVATION_IN_HOUSE,
  RESERVATION_NO_SHOW,
  RESERVATION_COMPLETED,
} from '../../shared/constants.js'
import { getLocalDateFromOffset } from '../../shared/util.js'

const props = defineProps({
  reservation: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['updated'])

// Композаблы
const { confirm: showConfirm } = useDialogs()
const { success, error } = useNotifications()

const t = {
  statusChanged: window.wp.i18n.__('Reservation status changed to %s', 'bookiflex'),
  failedToChange: window.wp.i18n.__('Failed to change reservation status', 'bookiflex'),
  confirmCancelMessage: window.wp.i18n.__('Confirm that this reservation is no longer valid and will be cancelled.', 'bookiflex'),
  cancelReservation: window.wp.i18n.__('Cancel Reservation', 'bookiflex'),
  keepReservation: window.wp.i18n.__('Keep Reservation', 'bookiflex'),
  confirmInHouseMessage: window.wp.i18n.__('Confirm that the guest has checked in and is currently staying at the property.', 'bookiflex'),
  markAsInHouse: window.wp.i18n.__('Mark as In-House', 'bookiflex'),
  checkIn: window.wp.i18n.__('Check In', 'bookiflex'),
  cancel: window.wp.i18n.__('Cancel', 'bookiflex'),
  confirmNoShowMessage: window.wp.i18n.__('Confirm that the guest did not arrive and did not cancel the reservation.', 'bookiflex'),
  markAsNoShow: window.wp.i18n.__('Mark as No-Show', 'bookiflex'),
  markNoShow: window.wp.i18n.__('Mark No-Show', 'bookiflex'),
  confirmCompleteMessage: window.wp.i18n.__('Confirm that the guest has checked out and the stay is fully completed.', 'bookiflex'),
  markAsCompleted: window.wp.i18n.__('Mark as Completed', 'bookiflex'),
  complete: window.wp.i18n.__('Complete', 'bookiflex'),
  confirmReservationMessage: window.wp.i18n.__('Confirm that this reservation is accepted and guaranteed according to hotel policy.', 'bookiflex'),
  confirmReservation: window.wp.i18n.__('Confirm Reservation', 'bookiflex'),
  confirm: window.wp.i18n.__('Confirm', 'bookiflex'),
  prolongMessage: window.wp.i18n.__('Extend the time given to the guest (+12h) for completing the payment and reactivate the reservation.', 'bookiflex'),
  prolongPaymentDeadline: window.wp.i18n.__('Prolong Payment Deadline', 'bookiflex'),
  extendDeadline: window.wp.i18n.__('Extend Deadline', 'bookiflex'),
  prolong: window.wp.i18n.__('Prolong', 'bookiflex'),
  inHouse: window.wp.i18n.__('In House', 'bookiflex'),
  noShow: window.wp.i18n.__('No Show', 'bookiflex'),
}

// Состояние
const disabled = ref(false)
const processingAction = ref(null)
const localeTimeZone = window.BookiFlex?.localeTimeZone || '+00:00'

// Вычисляемые свойства для отображения кнопок
const isShowCancelButton = computed(() => {
  return [
    RESERVATION_WAITING_CONFIRMATION,
    RESERVATION_WAITING_PAYMENT,
    RESERVATION_OVERDUE,
    RESERVATION_CONFIRMED,
  ].includes(props.reservation.status)
})

const isShowConfirmButton = computed(() => {
  return [RESERVATION_WAITING_CONFIRMATION].includes(props.reservation.status)
})

const isShowOverdueButton = computed(() => {
  return props.reservation.status === RESERVATION_OVERDUE
})

const isShowInHouseButton = computed(() => {
  const today = getLocalDateFromOffset(localeTimeZone)
  return props.reservation.status === RESERVATION_CONFIRMED && today >= props.reservation.checkInDate
})

const isShowNoShowButton = computed(() => {
  const today = getLocalDateFromOffset(localeTimeZone)
  return props.reservation.status === RESERVATION_CONFIRMED && today >= props.reservation.checkInDate
})

const isShowCompleteButton = computed(() => {
  return props.reservation.status === RESERVATION_IN_HOUSE
})

/**
 * Обработка изменения статуса
 */
const processAction = async (payload) => {
  processingAction.value = payload.status
  disabled.value = true

  try {
    const result = await changeStatus(payload)
    if (result) {
      // Обновляем турбо фрейм
      if (window.Turbo) {
        window.Turbo.visit(window.location.href, { frame: 'bflex-custom-tables' })
      }

      // Показываем уведомление об успехе
      success(window.wp.i18n.sprintf(t.statusChanged, payload.status))

      // Эмитим событие обновления
      emit('updated', { reservationId: props.reservation.id })
    }
  } catch (err) {
    error(t.failedToChange, {
      duration: 8000
    })
    console.error('Status change error:', err)
  } finally {
    disabled.value = false
    processingAction.value = null
  }
}

/**
 * Обработчики действий
 */
const onCancel = async () => {
  const confirmed = await showConfirm(
      t.confirmCancelMessage,
      {
        title: t.cancelReservation,
        variant: 'danger',
        confirmText: t.cancelReservation,
        cancelText: t.keepReservation
      }
  )

  if (confirmed) {
    await processAction({ id: props.reservation.id, status: RESERVATION_CANCELLED })
  }
}

const onInHouse = async () => {
  const confirmed = await showConfirm(
      t.confirmInHouseMessage,
      {
        title: t.markAsInHouse,
        variant: 'primary',
        confirmText: t.checkIn,
        cancelText: t.cancel
      }
  )

  if (confirmed) {
    await processAction({ id: props.reservation.id, status: RESERVATION_IN_HOUSE })
  }
}

const onNoShow = async () => {
  const confirmed = await showConfirm(
      t.confirmNoShowMessage,
      {
        title: t.markAsNoShow,
        variant: 'danger',
        confirmText: t.markNoShow,
        cancelText: t.cancel
      }
  )

  if (confirmed) {
    await processAction({ id: props.reservation.id, status: RESERVATION_NO_SHOW })
  }
}

const onComplete = async () => {
  const confirmed = await showConfirm(
      t.confirmCompleteMessage,
      {
        title: t.markAsCompleted,
        variant: 'success',
        confirmText: t.complete,
        cancelText: t.cancel
      }
  )

  if (confirmed) {
    await processAction({ id: props.reservation.id, status: RESERVATION_COMPLETED })
  }
}

const onConfirm = async () => {
  const confirmed = await showConfirm(
      t.confirmReservationMessage,
      {
        title: t.confirmReservation,
        variant: 'success',
        confirmText: t.confirm,
        cancelText: t.cancel
      }
  )

  if (confirmed) {
    await processAction({ id: props.reservation.id, status: RESERVATION_CONFIRMED })
  }
}

const onProlong = async () => {
  const confirmed = await showConfirm(
      t.prolongMessage,
      {
        title: t.prolongPaymentDeadline,
        variant: 'warning',
        confirmText: t.extendDeadline,
        cancelText: t.cancel
      }
  )

  if (confirmed) {
    await processAction({ id: props.reservation.id, status: RESERVATION_WAITING_PAYMENT })
  }
}
</script>

<template>
  <div class="reservation-actions">
    <sl-button
        v-if="isShowCancelButton"
        @click="onCancel"
        :loading="processingAction === RESERVATION_CANCELLED"
        :disabled="disabled"
        variant="danger"
        size="small"
        outline
    >
      {{ t.cancel }}
    </sl-button>

    <sl-button
        v-if="isShowOverdueButton"
        @click="onProlong"
        :loading="processingAction === RESERVATION_WAITING_PAYMENT"
        :disabled="disabled"
        variant="warning"
        size="small"
        outline
    >
      {{ t.prolong }}
    </sl-button>

    <sl-button
        v-if="isShowConfirmButton"
        @click="onConfirm"
        :loading="processingAction === RESERVATION_CONFIRMED"
        :disabled="disabled"
        variant="success"
        size="small"
    >
      {{ t.confirm }}
    </sl-button>

    <sl-button
        v-if="isShowInHouseButton"
        @click="onInHouse"
        :loading="processingAction === RESERVATION_IN_HOUSE"
        :disabled="disabled"
        variant="primary"
        size="small"
    >
      {{ t.inHouse }}
    </sl-button>

    <sl-button
        v-if="isShowNoShowButton"
        @click="onNoShow"
        :loading="processingAction === RESERVATION_NO_SHOW"
        :disabled="disabled"
        variant="danger"
        size="small"
    >
      {{ t.noShow }}
    </sl-button>

    <sl-button
        v-if="isShowCompleteButton"
        @click="onComplete"
        :loading="processingAction === RESERVATION_COMPLETED"
        :disabled="disabled"
        variant="neutral"
        size="small"
    >
      {{ t.complete }}
    </sl-button>
  </div>
</template>

<style scoped lang="scss"></style>
