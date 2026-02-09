import { ref, computed } from 'vue'

export function useDateNavigation() {
    // Текущая дата начала периода
    const dateFrom = ref(new Date().toISOString().split('T')[0])

    // Длительность периода в днях
    const periodLength = ref(14)

    // Доступные периоды
    const periodOptions = [
        { value: 14, label: '2 weeks' },
        { value: 30, label: '1 month' },
        { value: 90, label: '3 months' }
    ]

    /**
     * Вычисляемая дата окончания периода
     */
    const dateTo = computed(() => {
        const date = new Date(dateFrom.value)
        date.setDate(date.getDate() + Number(periodLength.value) - 1)
        return date.toISOString().split('T')[0]
    })

    /**
     * Массив дат для отображения
     */
    const dateRange = computed(() => {
        const range = []
        if (!dateFrom.value || !dateTo.value) return range

        const start = new Date(dateFrom.value)
        const end = new Date(dateTo.value)
        const current = new Date(start)

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December']
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

        while (current <= end) {
            range.push({
                iso8601: current.toISOString().split('T')[0],
                weekday: weekDays[current.getDay()],
                day: current.getDate(),
                month: monthNames[current.getMonth()],
                year: current.getFullYear(),
                isWeekend: current.getDay() === 0 || current.getDay() === 6
            })
            current.setDate(current.getDate() + 1)
        }

        return range
    })

    /**
     * Навигация вперед на один период
     */
    const navigateForward = () => {
        const date = new Date(dateTo.value)
        date.setDate(date.getDate() + 1)
        dateFrom.value = date.toISOString().split('T')[0]
    }

    /**
     * Навигация назад на один период
     */
    const navigateBackward = () => {
        const date = new Date(dateFrom.value)
        date.setDate(date.getDate() - Number(periodLength.value))
        dateFrom.value = date.toISOString().split('T')[0]
    }

    /**
     * Переход к сегодняшней дате
     */
    const navigateToToday = () => {
        dateFrom.value = new Date().toISOString().split('T')[0]
    }

    /**
     * Переход к конкретной дате
     */
    const navigateToDate = (date) => {
        if (date instanceof Date) {
            dateFrom.value = date.toISOString().split('T')[0]
        } else if (typeof date === 'string') {
            dateFrom.value = date
        }
    }

    /**
     * Изменение длины периода
     */
    const setPeriodLength = (length) => {
        if ([14, 30, 90].includes(Number(length))) {
            periodLength.value = Number(length)
        }
    }

    /**
     * Получение диапазона месяцев для заголовка
     */
    const monthsRange = computed(() => {
        const range = dateRange.value
        if (!range.length) return ''

        const firstMonth = range[0].month
        const lastMonth = range[range.length - 1].month
        const firstYear = range[0].year
        const lastYear = range[range.length - 1].year

        if (firstMonth === lastMonth && firstYear === lastYear) {
            return `${firstMonth} ${firstYear}`
        } else if (firstYear === lastYear) {
            return `${firstMonth} - ${lastMonth} ${firstYear}`
        } else {
            return `${firstMonth} ${firstYear} - ${lastMonth} ${lastYear}`
        }
    })

    return {
        // Данные
        dateFrom,
        dateTo,
        periodLength,
        periodOptions,
        dateRange,
        monthsRange,

        // Методы навигации
        navigateForward,
        navigateBackward,
        navigateToToday,
        navigateToDate,
        setPeriodLength
    }
}