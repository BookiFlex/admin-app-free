<!-- components/BaseDrawer.vue -->
<script setup>
import { computed, onMounted, watch } from 'vue'
import { useDrawer } from '../../composables/core/useDrawer.js'

const props = defineProps({
  /**
   * Заголовок drawer
   */
  label: {
    type: String,
    default: ''
  },

  /**
   * Показывать кнопку "Назад"
   */
  showBack: {
    type: Boolean,
    default: false
  },

  /**
   * Позиция drawer (start, end, top, bottom)
   */
  placement: {
    type: String,
    default: 'end'
  },

  /**
   * Автоматически показывать при монтировании
   */
  autoShow: {
    type: Boolean,
    default: true
  },

  /**
   * Дополнительные классы для контента
   */
  contentClass: {
    type: String,
    default: 'drawer-content'
  }
})

const emit = defineEmits([
  'close',      // Drawer закрыт
  'back',       // Нажата кнопка "Назад"
  'show',       // Drawer показан
  'hide',       // Drawer скрыт
  'afterShow',  // После анимации показа
  'afterHide'   // После анимации скрытия
])

const {
  drawerRef,
  isVisible,
  show,
  hide,
  close: closeDrawer,
  canNavigateBack
} = useDrawer()

/**
 * Обработчик закрытия drawer
 */
const handleClose = () => {
  // При закрытии всегда закрываем все drawer'ы в стеке
  emit('close')
  return closeDrawer()
}

/**
 * Обработчик кнопки "Назад"
 */
const handleBack = () => {
  emit('back')
}

/**
 * Обработчики событий Shoelace
 */
const handleAfterShow = () => {
  isVisible.value = true
  emit('afterShow')
}

const handleAfterHide = () => {
  isVisible.value = false
  emit('afterHide')
}

/**
 * Вычисляемое свойство для отображения кнопки "Назад"
 */
const shouldShowBack = computed(() => props.showBack || canNavigateBack())

// Автоматическое отображение при монтировании
onMounted(() => {
  if (props.autoShow) {
    show()
  }
})

// Следим за изменением видимости
watch(isVisible, (newVal) => {
  emit(newVal ? 'show' : 'hide')
})

// Экспортируем методы для использования через ref
defineExpose({
  show,
  hide,
  close: closeDrawer,
  isVisible
})
</script>

<template>
  <sl-drawer
      ref="drawerRef"
      :placement="placement"
      @sl-request-close="handleClose"
      @sl-after-show="handleAfterShow"
      @sl-after-hide="handleAfterHide"
  >
    <!-- Заголовок -->
    <div slot="label">
      <slot name="label">
        {{ label }}
      </slot>
    </div>

    <!-- Действия в заголовке -->
    <div v-if="shouldShowBack" slot="header-actions">
      <sl-icon-button
          name="arrow-left"
          @click="handleBack"
          style="color: #ffffff; margin-right: 5px"
      />
      <slot name="header-actions"></slot>
    </div>
    <div v-else slot="header-actions">
      <slot name="header-actions"></slot>
    </div>

    <!-- Основной контент -->
    <div :class="contentClass">
      <slot></slot>
    </div>

    <!-- Footer слот (опционально) -->
    <slot name="footer"></slot>
  </sl-drawer>
</template>