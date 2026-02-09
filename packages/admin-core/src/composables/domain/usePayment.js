import { ref, computed } from 'vue'
import { findPayment } from '../../api/api.js'
import { useApiError } from '../api/useApiError.js'

/**
 * Композабл для работы с данными платежа
 */
export function usePayment() {
    const payment = ref(null)
    const isLoading = ref(false)
    const { error, isError, withErrorHandling, clearError } = useApiError()

    /**
     * Загрузить данные платежа
     * @param {string|number} paymentId - ID платежа
     */
    const load = async (paymentId) => {
        if (!paymentId) {
            return { success: false, error: 'Payment ID is required' }
        }

        isLoading.value = true
        clearError()

        try {
            const { data, error: apiError } = await withErrorHandling(
                () => findPayment({ id: paymentId }),
                { operation: 'findPayment', paymentId }
            )

            if (apiError) {
                return { success: false, error: apiError }
            }

            if (data?.payment) {
                payment.value = data.payment
                return { success: true, data: payment.value }
            }

            return { success: false, error: 'Invalid response format' }
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Перезагрузить данные текущего платежа
     */
    const reload = async () => {
        if (payment.value?.id) {
            return await load(payment.value.id)
        }
        return { success: false, error: 'No payment to reload' }
    }

    /**
     * Вычисляемые свойства для статусов платежа
     */
    const isPaid = computed(() => payment.value?.status === 'PAID')

    const isPending = computed(() => payment.value?.status === 'PENDING')

    const isFailed = computed(() => payment.value?.status === 'FAILED')

    const isRefunded = computed(() => payment.value?.status === 'REFUNDED')

    const isPartiallyRefunded = computed(() =>
        payment.value?.status === 'PARTIALLY_REFUNDED'
    )

    const isCancelled = computed(() => payment.value?.status === 'CANCELLED')

    /**
     * Получить резервацию, связанную с платежом через указанный gateway
     */
    const getRelatedReservation = computed(() => {
        if (!payment.value?.allocations?.length) return null
        console.log('payment.value.allocations:' , payment.value.allocations)
        const allocation = payment.value.allocations.find(
            item => item.reservation?.paymentType?.gatewayName === payment.value.gatewayName
        )

        return allocation?.reservation || null
    })

    /**
     * Проверка наличия allocations
     */
    const hasAllocations = computed(() =>
        payment.value?.allocations?.length > 0
    )

    /**
     * Форматированная сумма платежа
     */
    const formattedAmount = computed(() => {
        if (!payment.value?.amount) return ''
        return formatMoney(payment.value.amount.amount, payment.value.amount.currency)
    })

    /**
     * Информация о клиенте
     */
    const clientFullName = computed(() => {
        if (!payment.value?.client) return ''
        const { firstName, lastName } = payment.value.client
        return `${firstName || ''} ${lastName || ''}`.trim()
    })

    const clientEmail = computed(() => payment.value?.client?.email || '')

    const clientPhone = computed(() => payment.value?.client?.phone || '')

    /**
     * Проверка наличия деталей от платежного шлюза
     */
    const hasGatewayDetails = computed(() => {
        return payment.value?.details &&
            (Array.isArray(payment.value.details) ?
                payment.value.details.length > 0 :
                Object.keys(payment.value.details).length > 0)
    })

    /**
     * Очистить данные
     */
    const clear = () => {
        payment.value = null
        clearError()
    }

    return {
        // Данные
        payment,

        // Состояние
        isLoading,
        error,
        isError,

        // Методы
        load,
        reload,
        clear,

        // Вычисляемые свойства статуса
        isPaid,
        isPending,
        isFailed,
        isRefunded,
        isPartiallyRefunded,
        isCancelled,

        // Связанные данные
        getRelatedReservation,
        hasAllocations,

        // Форматированные данные
        formattedAmount,
        clientFullName,
        clientEmail,
        clientPhone,
        hasGatewayDetails
    }
}

/**
 * Вспомогательная функция форматирования денег
 * @param {string|number} amount - Сумма
 * @param {string} currency - Валюта
 */
function formatMoney(amount, currency) {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'EUR'
        }).format(numAmount)
    } catch (e) {
        // Fallback для неподдерживаемых валют
        return `${currency || ''} ${numAmount.toFixed(2)}`
    }
}