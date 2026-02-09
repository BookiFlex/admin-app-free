<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  /**
   * Объект нотификации
   */
  notification: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'action'])

const alertRef = ref(null)
const isOpen = ref(true)

/**
 * Обработчик закрытия
 */
const handleClose = () => {
  isOpen.value = false
  // Даем время на анимацию Shoelace
  setTimeout(() => {
    emit('close', props.notification.id)
  }, 150)
}

/**
 * Обработчик клика на действие
 */
const handleAction = () => {
  emit('action', props.notification)
  // Закрываем после действия если не указано иное
  if (!props.notification.action?.keepOpen) {
    handleClose()
  }
}

/**
 * Следим за изменением состояния open в notification
 */
watch(() => props.notification.open, (newValue) => {
  if (!newValue) {
    handleClose()
  }
})

onMounted(() => {
  // Shoelace alert автоматически появляется если open=true
  if (alertRef.value && !props.notification.open) {
    alertRef.value.hide()
  }
})
</script>

<template>
  <sl-alert
      ref="alertRef"
      :variant="notification.type"
      :open="isOpen"
      :closable="notification.closable"
      @sl-request-close="handleClose"
      class="notification-alert"
  >
    <!-- Иконка -->
    <sl-icon
        v-if="notification.showIcon && notification.icon"
        slot="icon"
        :name="notification.icon"
    ></sl-icon>

    <!-- Заголовок -->
    <strong v-if="notification.title">{{ notification.title }}</strong>

    <!-- Сообщение -->
    <div class="notification-message">
      {{ notification.message }}
    </div>

    <!-- Действие (кнопка) -->
    <sl-button
        v-if="notification.action"
        slot="suffix"
        :variant="notification.action.variant || 'text'"
        :size="notification.action.size || 'small'"
        @click="handleAction"
    >
      {{ notification.action.label }}
    </sl-button>
  </sl-alert>
</template>

<style scoped>
.notification-alert {
  width: 100%;
}

.notification-message {
  margin-top: 0.25rem;
}

.notification-alert strong {
  display: block;
  margin-bottom: 0.25rem;
}

/* Переопределяем стили Shoelace для лучшего вида в стеке */
:deep(sl-alert) {
  margin: 0;
}

:deep(sl-alert::part(base)) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>