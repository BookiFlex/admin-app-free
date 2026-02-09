<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useDialogs, initDialogListeners } from '../../composables/core/useDialogs.js'
import DialogComponent from '../base/DialogComponent.vue'

const props = defineProps({
  /**
   * Настройки по умолчанию для диалогов
   */
  defaultOptions: {
    type: Object,
    default: () => ({})
  }
})

const { setDefaults } = useDialogs()

// Функция отписки от событий
let unsubscribe = null

onMounted(() => {
  // Устанавливаем настройки по умолчанию
  if (props.defaultOptions && Object.keys(props.defaultOptions).length > 0) {
    setDefaults(props.defaultOptions)
  }

  // Инициализируем слушатели событий
  unsubscribe = initDialogListeners()
})

onUnmounted(() => {
  // Отписываемся от событий
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<template>
  <!-- Компонент диалога -->
  <DialogComponent />

  <!-- Слот для дочерних элементов -->
  <slot></slot>
</template>
