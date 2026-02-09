<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useDialogs } from '../../composables/core/useDialogs.js'

const { activeDialog, resolve, cancel } = useDialogs()

const dialogRef = ref(null)
const inputRef = ref(null)
const localInputValue = ref('')
const inputError = ref('')

/**
 * Обработчик подтверждения
 */
const handleConfirm = async () => {
  if (!activeDialog.value) return

  const dialog = activeDialog.value

  if (dialog.type === 'prompt') {
    // Валидация для prompt
    if (dialog.validator) {
      const validationResult = await dialog.validator(localInputValue.value)
      if (validationResult !== true) {
        inputError.value = validationResult || 'Invalid input'
        return
      }
    }
    resolve(localInputValue.value)
  } else {
    resolve(true)
  }
}

/**
 * Обработчик отмены
 */
const handleCancel = () => {
  cancel()
}

/**
 * Обработчик закрытия диалога
 */
const handleRequestClose = (event) => {
  const dialog = activeDialog.value

  // Проверяем, можно ли закрыть через оверлей
  if (event.detail.source === 'overlay' && !dialog?.closeOnOverlay) {
    event.preventDefault()
    return
  }

  handleCancel()
}

/**
 * Классы для кнопки подтверждения
 */
const confirmButtonVariant = computed(() => {
  return activeDialog.value?.variant || 'primary'
})

/**
 * Следим за изменением активного диалога
 */
watch(activeDialog, async (newDialog) => {
  if (newDialog) {
    // Сбрасываем состояние
    localInputValue.value = newDialog.inputValue || ''
    inputError.value = ''

    // Ждем следующий тик для рендера DOM
    await nextTick()

    // Показываем диалог
    if (dialogRef.value) {
      dialogRef.value.show()
    }
  }
}, { immediate: true })

/**
 * Обработчик Enter для prompt
 */
const handleKeydown = (event) => {
  if (event.key === 'Enter' && activeDialog.value?.type === 'prompt') {
    handleConfirm()
  }
}

/**
 * Обработчик после скрытия диалога
 */
const handleAfterHide = () => {
  // Очищаем activeDialog после анимации скрытия
  if (activeDialog.value && !activeDialog.value.open) {
    // Даем время на анимацию
    setTimeout(() => {
      if (activeDialog.value && !activeDialog.value.open) {
        // Диалог был закрыт, обрабатываем следующий из очереди
      }
    }, 100)
  }
}
</script>

<template>
  <!-- Всегда рендерим, но показываем только когда есть activeDialog -->
  <sl-dialog
      ref="dialogRef"
      :label="activeDialog?.title || ''"
      :size="activeDialog?.size || 'small'"
      @sl-request-close="handleRequestClose"
      @sl-after-hide="handleAfterHide"
      class="dialog-component"
      :style="{ display: activeDialog ? 'block' : 'none' }"
  >
    <!-- Контент диалога -->
    <div v-if="activeDialog" class="dialog-content">
      <!-- Сообщение -->
      <div v-if="activeDialog.message" class="dialog-message">
        {{ activeDialog.message }}
      </div>

      <!-- Поле ввода для prompt -->
      <div v-if="activeDialog.type === 'prompt'" class="dialog-input">
        <sl-input
            ref="inputRef"
            v-model="localInputValue"
            :placeholder="activeDialog.inputPlaceholder"
            @keydown="handleKeydown"
            :class="{ 'input-invalid': inputError }"
        ></sl-input>
        <sl-alert v-if="inputError" variant="danger" open>
          <sl-icon slot="icon" name="exclamation-octagon"></sl-icon>
          {{ inputError }}
        </sl-alert>
      </div>

      <!-- Кастомный компонент для custom типа -->
      <component
          v-if="activeDialog.type === 'custom' && activeDialog.component"
          :is="activeDialog.component"
          v-bind="activeDialog.componentProps"
          @resolve="resolve"
          @cancel="cancel"
      />
    </div>

    <!-- Footer с кнопками -->
    <div v-if="activeDialog" slot="footer" class="dialog-footer">
      <sl-button
          v-if="activeDialog.showCancel"
          variant="neutral"
          @click="handleCancel"
      >
        {{ activeDialog.cancelText }}
      </sl-button>

      <sl-button
          :variant="confirmButtonVariant"
          @click="handleConfirm"
          :disabled="activeDialog.type === 'custom'"
      >
        {{ activeDialog.confirmText }}
      </sl-button>
    </div>
  </sl-dialog>
</template>

<style scoped>
.dialog-component {
  --sl-z-index-dialog: 999995;
}

.dialog-content {
  padding: 0;
}

.dialog-message {
  margin-bottom: 1rem;
  line-height: 1.5;
}

.dialog-input {
  margin-top: 1rem;
}

.dialog-input sl-input {
  width: 100%;
}

.dialog-input sl-alert {
  margin-top: 0.5rem;
}

.input-invalid::part(base) {
  border-color: var(--sl-color-danger-500);
}

.dialog-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Размеры диалогов */
:deep(sl-dialog[size="small"]::part(panel)) {
  max-width: 500px;
}

:deep(sl-dialog[size="medium"]::part(panel)) {
  max-width: 700px;
}

:deep(sl-dialog[size="large"]::part(panel)) {
  max-width: 900px;
}
</style>