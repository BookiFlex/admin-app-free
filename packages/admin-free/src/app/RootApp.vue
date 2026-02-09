<script setup>
import { reactive, onMounted, onUnmounted } from 'vue'
import {
  useGlobalDrawerNavigation,
  useNotifications,
  useDialogs,
  NotificationProvider,
  DialogProvider,
  RatePlanCalendar,
  reinitializeWpListTable
} from '@bookiflex/admin-core'

// Основное приложение
import AppController from './AppController.vue'

// Виджеты
// QuotaCalendar доступен только в Pro edition
// Здесь можно добавить другие виджеты при необходимости

// Отслеживаем какие mount points доступны
const mountPoints = reactive({
  app: false,
  ratePlanCalendar: false,
  // Добавляйте новые точки монтирования здесь
})

// Конфигурация виджетов
const widgetConfig = {
  app: {
    selector: '#bflex-app--app',
    key: 'app'
  },
  ratePlanCalendar: {
    selector: '#bflex-app--rate-plan-calendar-app',
    key: 'ratePlanCalendar'
  }
}

// Проверка наличия элементов в DOM
const checkMountPoints = () => {
  Object.entries(widgetConfig).forEach(([key, config]) => {
    const exists = !!document.querySelector(config.selector)
    if (mountPoints[config.key] !== exists) {
      mountPoints[config.key] = exists
      console.log(`Mount point ${config.key} is now ${exists ? 'available' : 'unavailable'}`)
    }
  })
}

// Observer для отслеживания динамических изменений DOM
let observer = null

const initObserver = () => {
  observer = new MutationObserver((mutations) => {
    // Проверяем только если были добавлены/удалены узлы
    const hasRelevantChanges = mutations.some(mutation =>
        mutation.type === 'childList' &&
        (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)
    )

    if (hasRelevantChanges) {
      checkMountPoints()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
}

// Инициализация глобальных сервисов
const initGlobalServices = () => {
  const notifications = useNotifications()
  const dialogs = useDialogs()
  const navigation = useGlobalDrawerNavigation()

  // Экспортируем глобально для использования вне Vue
  window.BookiFlex = window.BookiFlex || {}
  window.BookiFlex.notifications = notifications
  window.BookiFlex.dialogs = dialogs
  window.BookiFlex.navigation = navigation
}

// Обработка событий от внешних элементов (кнопки в WordPress админке)
const attachExternalEventListeners = () => {
  const appEvents = [
    { selector: '[data-action="show-reservation"]', eventName: 'bflex:reservation:details' },
    { selector: '[data-action="confirm-payment"]', eventName: 'bflex:payment:confirm' },
    { selector: '[data-action="show-payment-details"]', eventName: 'bflex:payment:details' },
    { selector: '[data-action="show-customer-details"]', eventName: 'bflex:customer:details' },
  ]

  appEvents.forEach(({ selector, eventName }) => {
    document.body.addEventListener('click', (e) => {
      const target = e.target.closest(selector)
      if (target && !target.dataset.listenerAttached) {
        e.preventDefault()
        e.stopPropagation()

        if (e.target.tagName !== 'sl-icon') {
          window.dispatchEvent(new CustomEvent(eventName, {
            detail: { id: target.dataset.id }
          }))
        }
      }
    })
  })
}

// Создаем ссылки на функции для правильного удаления event listeners
const handleTurboFrameLoad = () => {
  checkMountPoints()
  reinitializeWpListTable()
}

const handleTurboRender = () => {
  checkMountPoints()
  reinitializeWpListTable()
}

onMounted(() => {
  // Начальная проверка mount points
  checkMountPoints()

  // Инициализируем observer для динамических изменений
  initObserver()

  // Инициализируем глобальные сервисы
  initGlobalServices()

  // Подключаем обработчики для внешних элементов
  attachExternalEventListeners()

  // Слушаем Turbo события для переинициализации
  document.addEventListener('turbo:frame-load', handleTurboFrameLoad)
  document.addEventListener('turbo:render', handleTurboRender)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  document.removeEventListener('turbo:frame-load', handleTurboFrameLoad)
  document.removeEventListener('turbo:render', handleTurboRender)
})
</script>

<template>
  <!-- Провайдеры сервисов всегда активны -->
  <DialogProvider
      :default-options="{
      variant: 'primary',
      size: 'small',
      closeOnOverlay: true
    }"
  >
    <NotificationProvider
        :default-options="{
        position: 'bottom-left',
        duration: 5000,
        closable: true
      }"
        max-width="400px"
        offset="1rem"
        gap="0.5rem"
    >
      <!-- Основное приложение (Drawer управление и т.д.) -->
      <Teleport v-if="mountPoints.app" :to="widgetConfig.app.selector">
        <AppController />
      </Teleport>

      <!-- Виджет календаря тарифных планов -->
      <Teleport v-if="mountPoints.ratePlanCalendar" :to="widgetConfig.ratePlanCalendar.selector">
        <RatePlanCalendar />
      </Teleport>

      <!-- QuotaCalendar доступен только в Pro edition -->

      <!-- Добавляйте другие виджеты здесь по мере необходимости -->
      <!-- Пример:
      <Teleport v-if="mountPoints.bookingForm" to="#bflex-booking-form">
        <BookingForm />
      </Teleport>
      -->

      <!-- Скрытый контейнер для сервисных компонентов, которые не телепортируются -->
      <div class="bflex-service-container" style="display: none;">
        <!-- Здесь могут быть компоненты, которые должны быть в памяти, но не видны -->
      </div>
    </NotificationProvider>
  </DialogProvider>
</template>

<style>
/* Глобальные стили для BookiFlex если нужны */
.bflex-service-container {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>