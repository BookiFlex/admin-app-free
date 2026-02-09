import { ref } from 'vue'

/**
 * Глобальный обработчик ошибок API
 */
class ApiErrorHandler {
    constructor() {
        this.errorHandlers = []
    }

    /**
     * Регистрация обработчика ошибок
     */
    onError(handler) {
        this.errorHandlers.push(handler)
        // Возвращаем функцию для отписки
        return () => {
            const index = this.errorHandlers.indexOf(handler)
            if (index > -1) {
                this.errorHandlers.splice(index, 1)
            }
        }
    }

    /**
     * Обработка ошибки
     */
    handle(error, context = {}) {
        const errorInfo = this.parseError(error)

        // Вызываем все зарегистрированные обработчики
        this.errorHandlers.forEach(handler => handler(errorInfo, context))

        // Отправляем событие для уведомлений
        this.notifyError(errorInfo)

        return errorInfo
    }

    /**
     * Парсинг ошибки в унифицированный формат
     */
    parseError(error) {
        if (error.response) {
            // Ошибка от сервера
            return {
                type: 'server',
                status: error.response.status,
                message: error.response.data?.message || this.getDefaultMessage(error.response.status),
                details: error.response.data,
                timestamp: new Date().toISOString()
            }
        } else if (error.request) {
            // Запрос отправлен, но ответ не получен
            return {
                type: 'network',
                message: 'Network error. Please check your connection.',
                details: error.message,
                timestamp: new Date().toISOString()
            }
        } else {
            // Другая ошибка
            return {
                type: 'client',
                message: error.message || 'An unexpected error occurred',
                details: error,
                timestamp: new Date().toISOString()
            }
        }
    }

    /**
     * Получить сообщение по умолчанию для HTTP статуса
     */
    getDefaultMessage(status) {
        const messages = {
            400: 'Invalid request',
            401: 'Authentication required',
            403: 'Access denied',
            404: 'Resource not found',
            409: 'Conflict with current state',
            422: 'Validation failed',
            500: 'Server error',
            502: 'Service temporarily unavailable',
            503: 'Service unavailable'
        }
        return messages[status] || `Error ${status}`
    }

    /**
     * Отправить уведомление об ошибке
     */
    notifyError(errorInfo) {
        // Используем новую систему нотификаций если доступна
        if (window.BookiFlex?.notifications) {
            window.BookiFlex.notifications.error(errorInfo.message, {
                title: 'Error',
                duration: 5000
            })
        } else {
            // Fallback на событие для обратной совместимости
            window.dispatchEvent(new CustomEvent('bflex:notification', {
                detail: {
                    type: 'error',
                    message: errorInfo.message,
                    duration: 5000
                }
            }))
        }
    }
}

// Создаем единственный экземпляр
export const apiErrorHandler = new ApiErrorHandler()

/**
 * Композабл для использования в компонентах
 */
export function useApiError() {
    const error = ref(null)
    const isError = ref(false)

    /**
     * Обработать ошибку в контексте компонента
     */
    const handleError = (err, context = {}) => {
        error.value = apiErrorHandler.handle(err, context)
        isError.value = true
        return error.value
    }

    /**
     * Очистить ошибку
     */
    const clearError = () => {
        error.value = null
        isError.value = false
    }

    /**
     * Обертка для асинхронных вызовов с обработкой ошибок
     */
    const withErrorHandling = async (asyncFn, context = {}) => {
        clearError()
        try {
            const result = await asyncFn()
            return { data: result, error: null }
        } catch (err) {
            const errorInfo = handleError(err, context)
            return { data: null, error: errorInfo }
        }
    }

    return {
        error,
        isError,
        handleError,
        clearError,
        withErrorHandling
    }
}