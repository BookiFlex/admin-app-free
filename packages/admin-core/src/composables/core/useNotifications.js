import { ref, reactive, computed } from 'vue'

/**
 * Типы нотификаций (соответствуют типам Shoelace alert)
 */
export const NotificationTypes = {
    PRIMARY: 'primary',
    SUCCESS: 'success',
    NEUTRAL: 'neutral',
    WARNING: 'warning',
    DANGER: 'danger'
}

/**
 * Позиции для отображения нотификаций
 */
export const NotificationPositions = {
    TOP_LEFT: 'top-left',
    TOP_CENTER: 'top-center',
    TOP_RIGHT: 'top-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_CENTER: 'bottom-center',
    BOTTOM_RIGHT: 'bottom-right'
}

/**
 * Иконки для разных типов нотификаций
 */
const NotificationIcons = {
    [NotificationTypes.PRIMARY]: 'info-circle',
    [NotificationTypes.SUCCESS]: 'check-circle',
    [NotificationTypes.NEUTRAL]: 'info-circle',
    [NotificationTypes.WARNING]: 'exclamation-triangle',
    [NotificationTypes.DANGER]: 'exclamation-octagon'
}

/**
 * Класс для управления нотификациями
 */
class NotificationManager {
    constructor() {
        this.notifications = ref([])
        this.nextId = 1
        this.defaultOptions = reactive({
            position: NotificationPositions.BOTTOM_LEFT,
            duration: 5000,
            closable: true,
            showIcon: true
        })
    }

    /**
     * Установить опции по умолчанию
     */
    setDefaults(options) {
        Object.assign(this.defaultOptions, options)
    }

    /**
     * Показать нотификацию
     * @param {Object} options - Опции нотификации
     * @param {string} options.message - Текст сообщения (обязательно)
     * @param {string} options.type - Тип нотификации (primary, success, warning, danger, neutral)
     * @param {string} options.title - Заголовок нотификации
     * @param {number} options.duration - Длительность показа в мс (0 - без автоскрытия)
     * @param {boolean} options.closable - Можно ли закрыть нотификацию
     * @param {string} options.icon - Кастомная иконка
     * @param {boolean} options.showIcon - Показывать ли иконку
     * @param {string} options.position - Позиция на экране
     * @param {Function} options.onClose - Callback при закрытии
     * @param {Object} options.action - Действие (кнопка)
     * @returns {number} ID нотификации
     */
    show(options) {
        if (!options.message) {
            console.error('Notification message is required')
            return null
        }

        const notification = {
            id: this.nextId++,
            message: options.message,
            type: options.type || NotificationTypes.NEUTRAL,
            title: options.title || null,
            duration: options.duration !== undefined ? options.duration : this.defaultOptions.duration,
            closable: options.closable !== undefined ? options.closable : this.defaultOptions.closable,
            icon: options.icon || (options.showIcon !== false ? NotificationIcons[options.type || NotificationTypes.NEUTRAL] : null),
            showIcon: options.showIcon !== undefined ? options.showIcon : this.defaultOptions.showIcon,
            position: options.position || this.defaultOptions.position,
            onClose: options.onClose || null,
            action: options.action || null,
            createdAt: Date.now(),
            open: true
        }

        this.notifications.value.push(notification)

        // Автоматическое закрытие
        if (notification.duration > 0) {
            setTimeout(() => {
                this.close(notification.id)
            }, notification.duration)
        }

        return notification.id
    }

    /**
     * Закрыть нотификацию
     * @param {number} id - ID нотификации
     */
    close(id) {
        const index = this.notifications.value.findIndex(n => n.id === id)
        if (index !== -1) {
            const notification = this.notifications.value[index]
            notification.open = false

            // Вызов callback если есть
            if (notification.onClose) {
                notification.onClose()
            }

            // Удаление из массива после анимации
            setTimeout(() => {
                this.remove(id)
            }, 300)
        }
    }

    /**
     * Удалить нотификацию из массива
     * @param {number} id - ID нотификации
     */
    remove(id) {
        const index = this.notifications.value.findIndex(n => n.id === id)
        if (index !== -1) {
            this.notifications.value.splice(index, 1)
        }
    }

    /**
     * Закрыть все нотификации
     */
    closeAll() {
        this.notifications.value.forEach(n => {
            this.close(n.id)
        })
    }

    /**
     * Быстрые методы для разных типов нотификаций
     */
    success(message, options = {}) {
        return this.show({ ...options, message, type: NotificationTypes.SUCCESS })
    }

    error(message, options = {}) {
        return this.show({ ...options, message, type: NotificationTypes.DANGER })
    }

    warning(message, options = {}) {
        return this.show({ ...options, message, type: NotificationTypes.WARNING })
    }

    info(message, options = {}) {
        return this.show({ ...options, message, type: NotificationTypes.PRIMARY })
    }

    /**
     * Получить нотификации для конкретной позиции
     */
    getByPosition(position) {
        return this.notifications.value.filter(n => n.position === position)
    }

    /**
     * Получить все активные позиции
     */
    getActivePositions() {
        const positions = new Set()
        this.notifications.value.forEach(n => positions.add(n.position))
        return Array.from(positions)
    }
}

// Создаем глобальный экземпляр
export const notificationManager = new NotificationManager()

/**
 * Композабл для использования в компонентах
 */
export function useNotifications() {
    const notifications = computed(() => notificationManager.notifications.value)

    /**
     * Сгруппированные по позициям нотификации
     */
    const notificationsByPosition = computed(() => {
        const grouped = {}
        Object.values(NotificationPositions).forEach(position => {
            grouped[position] = notificationManager.getByPosition(position)
        })
        return grouped
    })

    /**
     * Активные позиции (где есть нотификации)
     */
    const activePositions = computed(() => notificationManager.getActivePositions())

    return {
        // Данные
        notifications,
        notificationsByPosition,
        activePositions,

        // Методы
        show: notificationManager.show.bind(notificationManager),
        close: notificationManager.close.bind(notificationManager),
        closeAll: notificationManager.closeAll.bind(notificationManager),

        // Быстрые методы
        success: notificationManager.success.bind(notificationManager),
        error: notificationManager.error.bind(notificationManager),
        warning: notificationManager.warning.bind(notificationManager),
        info: notificationManager.info.bind(notificationManager),

        // Настройки
        setDefaults: notificationManager.setDefaults.bind(notificationManager)
    }
}

/**
 * Обработчик для событий window (для обратной совместимости)
 */
export function handleNotificationEvent(event) {
    const { type, message, title, ...options } = event.detail || {}

    if (!message) return

    // Маппинг старых типов на новые если нужно
    const notificationType = type === 'error' ? NotificationTypes.DANGER : type

    notificationManager.show({
        message,
        title,
        type: notificationType,
        ...options
    })
}

/**
 * Инициализация слушателей событий
 */
export function initNotificationListeners() {
    // Слушаем старое событие для обратной совместимости
    window.addEventListener('bflex:notification', handleNotificationEvent)

    // Новое событие с более гибким API
    window.addEventListener('bflex:notify', (event) => {
        notificationManager.show(event.detail)
    })

    // Возвращаем функцию для отписки
    return () => {
        window.removeEventListener('bflex:notification', handleNotificationEvent)
        window.removeEventListener('bflex:notify', (event) => {
            notificationManager.show(event.detail)
        })
    }
}