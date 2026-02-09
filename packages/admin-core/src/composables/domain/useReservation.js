import { ref, computed } from 'vue'
import { loadReservation } from '../../api/api.js'
import { useApiError } from '../api/useApiError.js'

/**
 * Композабл для работы с данными резервации
 */
export function useReservation() {
    const reservation = ref(null)
    const totals = ref(null)
    const isLoading = ref(false)
    const { error, isError, withErrorHandling, clearError } = useApiError()

    /**
     * Загрузить данные резервации
     * @param {string|number} reservationId - ID резервации
     */
    const load = async (reservationId) => {
        if (!reservationId) {
            return { success: false, error: 'Reservation ID is required' }
        }

        isLoading.value = true
        clearError()

        try {
            const { data, error: apiError } = await withErrorHandling(
                () => loadReservation(reservationId),
                { operation: 'loadReservation', reservationId }
            )

            if (apiError) {
                return { success: false, error: apiError }
            }

            if (data?.reservations?.[0]) {
                reservation.value = data.reservations[0]
                totals.value = data.totals
                return { success: true, data: reservation.value }
            }

            return { success: false, error: 'Invalid response format' }
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Перезагрузить данные текущей резервации
     */
    const reload = async () => {
        if (reservation.value?.id) {
            return await load(reservation.value.id)
        }
        return { success: false, error: 'No reservation to reload' }
    }

    /**
     * Вычисляемые свойства для удобного доступа
     */
    const isCancelled = computed(() => reservation.value?.status === 'CANCELLED')

    const isConfirmed = computed(() => reservation.value?.status === 'CONFIRMED')

    const isWaitingConfirmation = computed(() =>
        reservation.value?.status === 'WAITING_CONFIRMATION'
    )

    const isPaid = computed(() =>
        reservation.value?.payment?.amounts?.paid >= reservation.value?.totalAmount
    )

    const hasPayments = computed(() =>
        reservation.value?.payment?.transactions?.length > 0
    )

    const needsPayment = computed(() =>
        reservation.value?.payment?.status?.isWaitingPayment
    )

    /**
     * Форматированные данные для отображения
     */
    const formattedCheckIn = computed(() =>
        reservation.value?.stay?.checkInDate || ''
    )

    const formattedCheckOut = computed(() =>
        reservation.value?.stay?.checkOutDate || ''
    )

    const guestFullName = computed(() => {
        if (!reservation.value?.customer) return ''
        const { firstName, lastName } = reservation.value.customer
        return `${firstName || ''} ${lastName || ''}`.trim()
    })

    const accommodationName = computed(() =>
        reservation.value?.accommodation?.type?.name || ''
    )

    const ratePlanName = computed(() =>
        reservation.value?.accommodation?.ratePlan?.name || ''
    )

    /**
     * Очистить данные
     */
    const clear = () => {
        reservation.value = null
        totals.value = null
        clearError()
    }

    return {
        // Данные
        reservation,
        totals,

        // Состояние
        isLoading,
        error,
        isError,

        // Методы
        load,
        reload,
        clear,

        // Вычисляемые свойства статуса
        isCancelled,
        isConfirmed,
        isWaitingConfirmation,
        isPaid,
        hasPayments,
        needsPayment,

        // Форматированные данные
        formattedCheckIn,
        formattedCheckOut,
        guestFullName,
        accommodationName,
        ratePlanName
    }
}