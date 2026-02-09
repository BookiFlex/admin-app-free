// main.js
// Import Turbo early to ensure it's available before any DOM operations
import '@bookiflex/admin-core/turbo'

import { createApp } from 'vue'
import { checkCDNDependencies, initShoelace } from '@bookiflex/admin-core'
import RootApp from './src/app/RootApp.vue'

// Initialize Shoelace with local assets path
initShoelace()

// Проверяем CDN-зависимости перед инициализацией
checkCDNDependencies()

// Инициализация глобального объекта BookiFlex
window.BookiFlex = window.BookiFlex || {}
window.BookiFlex.edition = 'free'

/**
 * Инициализация единого Vue приложения
 */
const initBookiFlexApp = () => {
  // Проверяем, не инициализировано ли уже приложение
  if (window.BookiFlex.app) {
    console.log('BookiFlex app already initialized')
    return
  }

  // Создаем корневой элемент для приложения если его нет
  let rootElement = document.getElementById('bflex-root')
  if (!rootElement) {
    rootElement = document.createElement('div')
    rootElement.id = 'bflex-root'
    // rootElement.style.display = 'none' // Скрываем корневой элемент
    document.body.appendChild(rootElement)
  }

  // Создаем Vue приложение
  const app = createApp(RootApp)

  // Опционально: игнорируем Shoelace компоненты при компиляции шаблонов
  // app.config.compilerOptions.isCustomElement = (tag) => tag.includes('sl-')

  // Монтируем приложение
  const instance = app.mount(rootElement)

  // Сохраняем ссылку на приложение глобально
  window.BookiFlex.app = app
  window.BookiFlex.instance = instance

  console.log('BookiFlex app initialized successfully')
}

/**
 * Инициализация при загрузке DOM
 */
const initOnDOMReady = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBookiFlexApp)
  } else {
    // DOM уже загружен
    initBookiFlexApp()
  }
}

/**
 * Обработка Turbo событий для реинициализации при навигации
 */
const initTurboSupport = () => {
  // Turbo Drive события
  document.addEventListener('turbo:load', () => {
    // При навигации через Turbo проверяем, нужно ли переинициализировать
    if (!window.BookiFlex.app) {
      initBookiFlexApp()
    }
  })

  // Turbo Frame события
  document.addEventListener('turbo:frame-load', () => {
    // При загрузке фрейма отправляем событие для проверки mount points
    if (window.BookiFlex.instance) {
      // RootApp автоматически проверит mount points через свой observer
      console.log('Turbo frame loaded, mount points will be checked automatically')
    }
  })

  // При рендере Turbo
  document.addEventListener('turbo:render', () => {
    if (!window.BookiFlex.app) {
      initBookiFlexApp()
    }
  })
}

/**
 * Экспорт функции для ручной инициализации если нужно
 */
window.BookiFlex.init = initBookiFlexApp

/**
 * Экспорт функции для деинициализации (полезно для горячей перезагрузки в dev)
 */
window.BookiFlex.destroy = () => {
  if (window.BookiFlex.app) {
    window.BookiFlex.app.unmount()
    window.BookiFlex.app = null
    window.BookiFlex.instance = null
    console.log('BookiFlex app destroyed')
  }
}

/**
 * Функция для добавления нового виджета в runtime (для будущего расширения)
 */
window.BookiFlex.registerWidget = (selector, component) => {
  console.warn('Dynamic widget registration not yet implemented. Add widget to RootApp.vue')
  // В будущем можно реализовать динамическую регистрацию
}

// Запускаем инициализацию
initOnDOMReady()
initTurboSupport()

// Экспортируем для использования в других модулях если нужно
export { initBookiFlexApp }