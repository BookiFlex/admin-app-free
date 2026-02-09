<!-- components/NotificationProvider.vue -->
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useNotifications, NotificationPositions, initNotificationListeners } from '../../composables/core/useNotifications.js'
import NotificationContainer from '../base/NotificationContainer.vue'

const props = defineProps({
  /**
   * Позиции, в которых могут появляться нотификации
   * По умолчанию - все позиции
   */
  positions: {
    type: Array,
    default: () => Object.values(NotificationPositions)
  },

  /**
   * Настройки по умолчанию для нотификаций
   */
  defaultOptions: {
    type: Object,
    default: () => ({})
  },

  /**
   * Максимальная ширина нотификаций
   */
  maxWidth: {
    type: String,
    default: '400px'
  },

  /**
   * Отступ от края экрана
   */
  offset: {
    type: String,
    default: '1rem'
  },

  /**
   * Расстояние между нотификациями
   */
  gap: {
    type: String,
    default: '0.5rem'
  }
})

const { setDefaults, activePositions } = useNotifications()

// Функция отписки от событий
let unsubscribe = null

onMounted(() => {
  // Устанавливаем настройки по умолчанию
  if (props.defaultOptions && Object.keys(props.defaultOptions).length > 0) {
    setDefaults(props.defaultOptions)
  }

  // Инициализируем слушатели событий
  unsubscribe = initNotificationListeners()
})

onUnmounted(() => {
  // Отписываемся от событий
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<template>
  <!-- Рендерим контейнеры для всех позиций, управляя видимостью через prop -->
  <NotificationContainer
      v-for="position in positions"
      :key="position"
      :position="position"
      :visible="activePositions.includes(position)"
      :max-width="maxWidth"
      :offset="offset"
      :gap="gap"
  />

  <!-- Слот для дочерних элементов -->
  <slot></slot>
</template>