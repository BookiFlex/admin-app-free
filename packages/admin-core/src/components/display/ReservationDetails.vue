<script setup>
import { formatDateShort } from '../../shared/util.js'

defineProps({
  reservation: {
    type: Object,
    required: true,
  }
})

const t = {
  reservationDetails: window.wp.i18n.__('Reservation details', 'bookiflex'),
  checkIn: window.wp.i18n.__('Check-in', 'bookiflex'),
  checkOut: window.wp.i18n.__('Check-out', 'bookiflex'),
  nights: window.wp.i18n.__('Nights', 'bookiflex'),
  accommodationType: window.wp.i18n.__('Rental unit', 'bookiflex'),
  guests: window.wp.i18n.__('Guests', 'bookiflex'),
  adults: window.wp.i18n.__('adults', 'bookiflex'),
  ratePlan: window.wp.i18n.__('Rate plan', 'bookiflex'),
  cancellationPolicy: window.wp.i18n.__('Cancellation policy', 'bookiflex'),
  paymentType: window.wp.i18n.__('Payment type', 'bookiflex'),
  waitingPaymentUntil: window.wp.i18n.__('Waiting payment until', 'bookiflex'),
}
</script>

<template>
  <div class="section reservation-section">
    <div class="section-title">{{ t.reservationDetails }}</div>
    <div class="dates-grid">
      <div class="date-item">
        <div class="date-label">{{ t.checkIn }}</div>
        <div class="date-value">{{ formatDateShort(reservation.stay.checkInDate) }}</div>
      </div>
      <div class="date-item">
        <div class="date-label">{{ t.checkOut }}</div>
        <div class="date-value">{{ formatDateShort(reservation.stay.checkOutDate) }}</div>
      </div>
      <div class="date-item">
        <div class="date-label">{{ t.nights }}</div>
        <div class="date-value">{{ reservation.stay.los }}</div>
      </div>
    </div>
    <div class="accommodation-info">
      <div class="info-item">
        <div class="info-label">{{ t.accommodationType }}</div>
        <div class="info-value">{{ reservation.accommodation.type.name }} ({{ reservation.accommodation.type.code }})</div>
      </div>
      <div class="info-item">
        <div class="info-label">{{ t.guests }}</div>
        <div class="info-value">
          {{ reservation.stay.guests.adults }} {{ t.adults }}
          {{
            reservation.stay.guests.children.length
                ? `children [${reservation.stay.guests.children.join(', ')}]`
                : ''
          }}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">{{ t.ratePlan }}</div>
        <div class="info-value">{{ reservation.accommodation.ratePlan.name }} ({{ reservation.accommodation.ratePlan.code }})</div>
      </div>
      <div class="info-item">
        <div class="info-label">{{ t.cancellationPolicy }}</div>
        <div class="info-value">{{ reservation.cancellation.policy.name }}</div>
      </div>
      <div class="info-item">
        <div class="info-label">{{ t.paymentType }}</div>
        <div class="info-value">{{ reservation.payment.method.name }}</div>
      </div>
      <div class="info-item">
        <div class="info-label">{{ t.waitingPaymentUntil }}</div>
        <div class="info-value">{{ reservation.payment.status.waitingUntil || '-' }}</div>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<style scoped lang="scss"></style>
