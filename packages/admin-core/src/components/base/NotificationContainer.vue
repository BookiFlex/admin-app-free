<!-- components/NotificationContainer.vue -->
<script setup>
import { computed } from 'vue'
import { useNotifications, NotificationPositions } from '../../composables/core/useNotifications.js'
import NotificationAlert from './NotificationAlert.vue'

const props = defineProps({
  /**
   * Позиция контейнера
   */
  position: {
    type: String,
    required: true,
    validator: (value) => Object.values(NotificationPositions).includes(value)
  },

  /**
   * Видимость контейнера
   */
  visible: {
    type: Boolean,
    default: true
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

const { notificationsByPosition, close } = useNotifications()

/**
 * Нотификации для текущей позиции
 */
const notifications = computed(() =>
    notificationsByPosition.value[props.position] || []
)

/**
 * CSS классы для позиционирования
 */
const containerClasses = computed(() => {
  const classes = ['notification-container']

  // Добавляем классы для позиционирования
  const [vertical, horizontal] = props.position.split('-')
  classes.push(`notification-container--${vertical}`)
  classes.push(`notification-container--${horizontal}`)

  return classes
})

/**
 * Стили контейнера
 */
const containerStyles = computed(() => {
  const [vertical, horizontal] = props.position.split('-')
  const styles = {
    '--notification-max-width': props.maxWidth,
    '--notification-gap': props.gap
  }

  // Вертикальное позиционирование
  if (vertical === 'top') {
    styles.top = props.offset
  } else {
    styles.bottom = props.offset
  }

  // Горизонтальное позиционирование
  if (horizontal === 'left') {
    styles.left = props.offset
  } else if (horizontal === 'right') {
    styles.right = props.offset
  } else {
    // center
    styles.left = '50%'
    styles.transform = 'translateX(-50%)'
  }

  return styles
})

/**
 * Обработчик закрытия нотификации
 */
const handleClose = (notificationId) => {
  close(notificationId)
}

/**
 * Обработчик действия нотификации
 */
const handleAction = (notification) => {
  if (notification.action && notification.action.handler) {
    notification.action.handler(notification)
  }
}
</script>

<template>
  <Teleport to="body">
    <div
        v-show="visible && notifications.length > 0"
        :class="containerClasses"
        :style="containerStyles"
    >
      <TransitionGroup
          name="notification"
          tag="div"
          class="notification-list"
      >
        <NotificationAlert
            v-for="notification in notifications"
            :key="notification.id"
            :notification="notification"
            @close="handleClose"
            @action="handleAction"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.notification-container {
  position: fixed;
  z-index: 100003;
  pointer-events: none;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--notification-gap);
  max-width: var(--notification-max-width);
  pointer-events: auto;
}

/* Анимации появления/исчезновения */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Для правой стороны - анимация с другой стороны */
.notification-container--right .notification-enter-from {
  transform: translateX(30px);
}

.notification-container--right .notification-leave-to {
  transform: translateX(-30px);
}

/* Для центра - анимация по вертикали */
.notification-container--center .notification-enter-from {
  transform: translateY(-30px);
}

.notification-container--center .notification-leave-to {
  transform: translateY(-30px);
}

.notification-container--bottom.notification-container--center .notification-enter-from {
  transform: translateY(30px);
}

.notification-container--bottom.notification-container--center .notification-leave-to {
  transform: translateY(30px);
}

/* Анимация сдвига при удалении элемента из середины */
.notification-move {
  transition: transform 0.3s ease;
}
</style>