<!-- components/PenaltyStatus.vue -->
<script setup>
import { computed, ref } from 'vue'
import { useDialogs } from '../../composables/core/useDialogs.js'
import { useNotifications } from '../../composables/core/useNotifications.js'
import { formatMoney } from "../../shared/util.js";
import { resolvePenalty } from "../../api/api.js";

const props = defineProps({
  penalty: {
    type: Object,
    required: true
  },
  prepaidAmount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'EUR'
  }
})

const emit = defineEmits(['resolved'])

// Композаблы
const { prompt } = useDialogs()
const { success, error } = useNotifications()

const t = {
  noActionRequired: window.wp.i18n.__('No action required', 'bookiflex'),
  noActionMessage: window.wp.i18n.__('No prepayment and no penalty. No further action required.', 'bookiflex'),
  penaltyToCollect: window.wp.i18n.__('Penalty to collect', 'bookiflex'),
  penaltyToCollectMessage: window.wp.i18n.__('No prepayment was taken. Penalty of %s is calculated, but must be collected manually if applicable.', 'bookiflex'),
  fullyCovered: window.wp.i18n.__('Fully covered', 'bookiflex'),
  fullyCoveredMessage: window.wp.i18n.__('The penalty equals the prepayment. The prepayment fully covers the penalty. No refund or additional action is required.', 'bookiflex'),
  refundRequired: window.wp.i18n.__('Refund required', 'bookiflex'),
  refundRequiredMessage: window.wp.i18n.__('The prepayment (%s) is higher than the penalty (%s). Refund %s to the guest manually via your payment provider.', 'bookiflex'),
  additionalCollectionPossible: window.wp.i18n.__('Additional collection possible', 'bookiflex'),
  additionalCollectionMessage: window.wp.i18n.__('The prepayment (%s) is lower than the penalty (%s). The guest loses the prepayment. Additional amount %s can be collected manually if required.', 'bookiflex'),
  penaltyResolved: window.wp.i18n.__('Penalty Resolved', 'bookiflex'),
  amount: window.wp.i18n.__('Amount', 'bookiflex'),
  resolvedAt: window.wp.i18n.__('Resolved at', 'bookiflex'),
  comment: window.wp.i18n.__('Comment', 'bookiflex'),
  recommendation: window.wp.i18n.__('Recommendation', 'bookiflex'),
  markAsResolved: window.wp.i18n.__('Mark as resolved', 'bookiflex'),
  provideNotes: window.wp.i18n.__('Please provide any additional notes about resolving this penalty (optional):', 'bookiflex'),
  markPenaltyAsResolved: window.wp.i18n.__('Mark Penalty as Resolved', 'bookiflex'),
  confirm: window.wp.i18n.__('Confirm', 'bookiflex'),
  cancel: window.wp.i18n.__('Cancel', 'bookiflex'),
  enterComment: window.wp.i18n.__('Enter your comment here...', 'bookiflex'),
  penaltyMarkedResolved: window.wp.i18n.__('Penalty marked as resolved successfully', 'bookiflex'),
  failedToResolve: window.wp.i18n.__('Failed to resolve penalty. Please try again.', 'bookiflex'),
}

// Состояние
const isResolving = ref(false)

// Вычисляемые свойства для логики рекомендаций
const penaltyAmount = computed(() => props.penalty?.amount || 0)

const isResolved = computed(() => props.penalty?.status === 'resolved')

const recommendation = computed(() => {
  const prepaid = props.prepaidAmount
  const penalty = penaltyAmount.value

  if (prepaid === 0 && penalty === 0) {
    return {
      type: 'info',
      title: t.noActionRequired,
      message: t.noActionMessage,
      showButton: false
    }
  }

  if (prepaid === 0 && penalty > 0) {
    return {
      type: 'warning',
      title: t.penaltyToCollect,
      message: window.wp.i18n.sprintf(t.penaltyToCollectMessage, formatMoney(penalty, props.currency)),
      showButton: true
    }
  }

  if (prepaid === penalty) {
    return {
      type: 'success',
      title: t.fullyCovered,
      message: t.fullyCoveredMessage,
      showButton: true
    }
  }

  if (prepaid > penalty) {
    const refundAmount = prepaid - penalty
    return {
      type: 'warning',
      title: t.refundRequired,
      message: window.wp.i18n.sprintf(
        t.refundRequiredMessage,
        formatMoney(prepaid, props.currency),
        formatMoney(penalty, props.currency),
        formatMoney(refundAmount, props.currency)
      ),
      showButton: true
    }
  }

  if (prepaid < penalty) {
    const additionalAmount = penalty - prepaid
    return {
      type: 'warning',
      title: t.additionalCollectionPossible,
      message: window.wp.i18n.sprintf(
        t.additionalCollectionMessage,
        formatMoney(prepaid, props.currency),
        formatMoney(penalty, props.currency),
        formatMoney(additionalAmount, props.currency)
      ),
      showButton: true
    }
  }

  return {
    type: 'info',
    title: '',
    message: '',
    showButton: false
  }
})

// Методы
const handleMarkAsResolved = async () => {
  // Запрашиваем комментарий через prompt диалог
  const comment = await prompt(
      t.provideNotes,
      {
        title: t.markPenaltyAsResolved,
        confirmText: t.confirm,
        cancelText: t.cancel,
        inputPlaceholder: t.enterComment,
        inputValue: ''
      }
  )

  // Если пользователь отменил диалог
  if (comment === null) {
    return
  }

  isResolving.value = true

  try {
    // TODO: Вызов API для обновления статуса penalty
    await resolvePenalty(props.penalty.id, comment || null)

    success(t.penaltyMarkedResolved)

    // Эмитим событие для родительского компонента
    emit('resolved', {
      penaltyId: props.penalty.id,
      comment
    })
  } catch (err) {
    error(t.failedToResolve)
    console.error('Error resolving penalty:', err)
  } finally {
    isResolving.value = false
  }
}

// Вычисляем вариант оформления карточки
const cardVariant = computed(() => {
  if (isResolved.value) return 'success'

  const recType = recommendation.value.type
  if (recType === 'warning') return 'warning'
  if (recType === 'success') return 'primary'
  return 'default'
})
</script>

<template>
  <sl-card
      class="penalty-status"
      :class="{
      'penalty-status--resolved': isResolved,
      [`penalty-status--${recommendation.type}`]: !isResolved
    }"
  >
    <!-- Если penalty уже resolved -->
    <div v-if="isResolved" class="penalty-status__resolved">
      <div class="penalty-status__header">
        <sl-icon name="check-circle-fill" class="icon-success"></sl-icon>
        <h3>{{ t.penaltyResolved }}</h3>
      </div>

      <div class="penalty-status__details">
        <p>
          <strong>{{ t.amount }}:</strong>
          {{ formatMoney(penaltyAmount, currency) }}
        </p>
        <p v-if="penalty.appliedAt">
          <strong>{{ t.resolvedAt }}:</strong>
          {{ new Date(penalty.appliedAt).toLocaleString() }}
        </p>
        <p v-if="penalty.comment">
          <strong>{{ t.comment }}:</strong>
          {{ penalty.comment }}
        </p>
      </div>
    </div>

    <!-- Если penalty еще не resolved -->
    <div v-else class="penalty-status__pending">
      <div class="penalty-status__header">
        <h3>{{ recommendation.title || t.recommendation }}</h3>
      </div>

      <div class="penalty-status__content">
        <p>{{ recommendation.message }}</p>

        <!-- Детали penalty -->
        <div v-if="penalty.description" class="penalty-status__description">
          <sl-divider></sl-divider>
          <p class="text-muted">
            <small>{{ penalty.description }}</small>
          </p>
        </div>
      </div>

      <!-- Кнопка действия -->
      <div v-if="recommendation.showButton" class="penalty-status__actions">
        <sl-button
            size="small"
            :variant="penaltyAmount === 0 ? 'success' : 'primary'"
            :loading="isResolving"
            @click="handleMarkAsResolved"
        >
          <sl-icon slot="prefix" name="check2-square"></sl-icon>
          {{ t.markAsResolved }}
        </sl-button>
      </div>
    </div>
  </sl-card>
</template>

<style scoped lang="scss">
.penalty-status {
  margin-top: 12px;
  width: 100%;

  &--resolved {
    --border-color: var(--sl-color-success-600);

    .icon-success {
      color: var(--sl-color-success-600);
      font-size: 1.25rem;
    }
  }

  &--warning {
    --border-color: var(--sl-color-warning-600);
    background: var(--sl-color-warning-50);
  }

  &--success {
    --border-color: var(--sl-color-success-600);
    background: var(--sl-color-success-50);
  }

  &--info {
    --border-color: var(--sl-color-neutral-600);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    h3 {
      margin: 0;
      padding: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--sl-color-neutral-900);
    }
  }

  &__content {
    p {
      margin: 0.5rem 0;
      line-height: 1.5;
      color: var(--sl-color-neutral-700);
    }
  }

  &__description {
    margin-top: 0.75rem;

    .text-muted {
      color: var(--sl-color-neutral-600);
      font-style: italic;
    }
  }

  &__details {
    p {
      margin: 0.25rem 0;
      font-size: 0.875rem;

      strong {
        color: var(--sl-color-neutral-700);
      }
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--sl-color-neutral-200);
  }
}
</style>