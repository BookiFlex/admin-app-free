import { ref, reactive } from 'vue'

/**
 * Типы диалогов
 */
export const DialogTypes = {
    CONFIRM: 'confirm',
    ALERT: 'alert',
    PROMPT: 'prompt',
    CUSTOM: 'custom'
}

/**
 * Варианты кнопок (соответствуют Shoelace button variants)
 */
export const DialogVariants = {
    PRIMARY: 'primary',
    SUCCESS: 'success',
    NEUTRAL: 'neutral',
    WARNING: 'warning',
    DANGER: 'danger'
}

/**
 * Класс для управления диалогами
 */
class DialogManager {
    constructor() {
        this.activeDialog = ref(null)
        this.dialogQueue = ref([])
        this.nextId = 1
        this.defaultOptions = reactive({
            type: DialogTypes.CONFIRM,
            variant: DialogVariants.PRIMARY,
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            showCancel: true,
            closeOnOverlay: true,
            size: 'small' // small, medium, large
        })
    }

    /**
     * Установить опции по умолчанию
     */
    setDefaults(options) {
        Object.assign(this.defaultOptions, options)
    }

    /**
     * Показать диалог
     * @param {Object} options - Опции диалога
     * @param {string} options.title - Заголовок диалога
     * @param {string} options.message - Сообщение/контент диалога
     * @param {string} options.type - Тип диалога (confirm, alert, prompt, custom)
     * @param {string} options.variant - Вариант стиля (primary, success, warning, danger, neutral)
     * @param {string} options.confirmText - Текст кнопки подтверждения
     * @param {string} options.cancelText - Текст кнопки отмены
     * @param {boolean} options.showCancel - Показывать ли кнопку отмены
     * @param {string} options.size - Размер диалога
     * @param {boolean} options.closeOnOverlay - Закрывать ли при клике на оверлей
     * @param {string} options.inputValue - Начальное значение для prompt
     * @param {string} options.inputPlaceholder - Placeholder для prompt
     * @param {Function} options.validator - Валидатор для prompt
     * @param {Object} options.component - Компонент для custom диалога
     * @param {Object} options.componentProps - Props для custom компонента
     * @returns {Promise} - Promise с результатом диалога
     */
    show(options) {
        return new Promise((resolve, reject) => {
            const dialog = {
                id: this.nextId++,
                title: options.title || '',
                message: options.message || '',
                type: options.type || this.defaultOptions.type,
                variant: options.variant || this.defaultOptions.variant,
                confirmText: options.confirmText || this.defaultOptions.confirmText,
                cancelText: options.cancelText || this.defaultOptions.cancelText,
                showCancel: options.showCancel !== undefined ? options.showCancel : this.defaultOptions.showCancel,
                size: options.size || this.defaultOptions.size,
                closeOnOverlay: options.closeOnOverlay !== undefined ? options.closeOnOverlay : this.defaultOptions.closeOnOverlay,
                inputValue: options.inputValue || '',
                inputPlaceholder: options.inputPlaceholder || '',
                validator: options.validator || null,
                component: options.component || null,
                componentProps: options.componentProps || {},
                resolve,
                reject,
                open: true,
                createdAt: Date.now()
            }

            // Если есть активный диалог, добавляем в очередь
            if (this.activeDialog.value) {
                this.dialogQueue.value.push(dialog)
            } else {
                this.activeDialog.value = dialog
            }

            return dialog.promise
        })
    }

    /**
     * Закрыть текущий диалог с результатом
     * @param {any} result - Результат диалога
     */
    resolve(result) {
        if (!this.activeDialog.value) return

        const dialog = this.activeDialog.value
        dialog.open = false

        // Резолвим промис
        if (dialog.resolve) {
            dialog.resolve(result)
        }

        // Переходим к следующему диалогу из очереди
        setTimeout(() => {
            this.processNext()
        }, 300) // Даем время на анимацию закрытия
    }

    /**
     * Отменить текущий диалог
     */
    cancel() {
        if (!this.activeDialog.value) return

        const dialog = this.activeDialog.value
        dialog.open = false

        // Резолвим с false для confirm, null для остальных
        if (dialog.resolve) {
            const result = dialog.type === DialogTypes.CONFIRM ? false : null
            dialog.resolve(result)
        }

        // Переходим к следующему диалогу
        setTimeout(() => {
            this.processNext()
        }, 300)
    }

    /**
     * Обработать следующий диалог из очереди
     */
    processNext() {
        this.activeDialog.value = null

        if (this.dialogQueue.value.length > 0) {
            this.activeDialog.value = this.dialogQueue.value.shift()
        }
    }

    /**
     * Быстрые методы для разных типов диалогов
     */

    /**
     * Показать диалог подтверждения
     */
    confirm(message, options = {}) {
        return this.show({
            ...options,
            message,
            type: DialogTypes.CONFIRM,
            showCancel: true
        })
    }

    /**
     * Показать alert диалог
     */
    alert(message, options = {}) {
        return this.show({
            ...options,
            message,
            type: DialogTypes.ALERT,
            showCancel: false
        })
    }

    /**
     * Показать prompt диалог
     */
    prompt(message, options = {}) {
        return this.show({
            ...options,
            message,
            type: DialogTypes.PROMPT,
            showCancel: true
        })
    }

    /**
     * Показать диалог с ошибкой
     */
    error(message, options = {}) {
        return this.show({
            ...options,
            message,
            type: DialogTypes.ALERT,
            variant: DialogVariants.DANGER,
            title: options.title || 'Error',
            showCancel: false
        })
    }

    /**
     * Показать диалог с предупреждением
     */
    warning(message, options = {}) {
        return this.show({
            ...options,
            message,
            type: DialogTypes.CONFIRM,
            variant: DialogVariants.WARNING,
            title: options.title || 'Warning'
        })
    }

    /**
     * Показать диалог успеха
     */
    success(message, options = {}) {
        return this.show({
            ...options,
            message,
            type: DialogTypes.ALERT,
            variant: DialogVariants.SUCCESS,
            title: options.title || 'Success',
            showCancel: false
        })
    }
}

// Создаем глобальный экземпляр
export const dialogManager = new DialogManager()

/**
 * Композабл для использования в компонентах
 */
export function useDialogs() {
    return {
        // Данные
        activeDialog: dialogManager.activeDialog,
        dialogQueue: dialogManager.dialogQueue,

        // Методы
        show: dialogManager.show.bind(dialogManager),
        confirm: dialogManager.confirm.bind(dialogManager),
        alert: dialogManager.alert.bind(dialogManager),
        prompt: dialogManager.prompt.bind(dialogManager),
        error: dialogManager.error.bind(dialogManager),
        warning: dialogManager.warning.bind(dialogManager),
        success: dialogManager.success.bind(dialogManager),

        // Управление
        resolve: dialogManager.resolve.bind(dialogManager),
        cancel: dialogManager.cancel.bind(dialogManager),
        setDefaults: dialogManager.setDefaults.bind(dialogManager)
    }
}

/**
 * Обработчик для событий window (для обратной совместимости)
 */
export function handleDialogEvent(event) {
    const { label, message, variant, confirmTxt, ...options } = event.detail || {}

    if (!message) return

    // Маппинг старых параметров на новые
    const dialogOptions = {
        title: label || '',
        message,
        variant: variant || DialogVariants.PRIMARY,
        confirmText: confirmTxt || 'Confirm',
        type: DialogTypes.CONFIRM,
        ...options
    }

    return dialogManager.show(dialogOptions)
}

/**
 * Инициализация слушателей событий
 */
export function initDialogListeners() {
    // Слушаем старое событие для обратной совместимости
    // const legacyHandler = async (event) => {
    //     const result = await handleDialogEvent(event)
    //     // Эмитим результат в старом формате
    //     window.dispatchEvent(new CustomEvent('bflex:dialog:result', {
    //         detail: { id: event.detail.id, result }
    //     }))
    // }

    // window.addEventListener('bflex:dialog', legacyHandler)

    // Новое событие с более гибким API
    window.addEventListener('bflex:show-dialog', (event) => {
        dialogManager.show(event.detail)
    })

    // Возвращаем функцию для отписки
    return () => {
        // window.removeEventListener('bflex:dialog', legacyHandler)
        window.removeEventListener('bflex:show-dialog', (event) => {
            dialogManager.show(event.detail)
        })
    }
}
