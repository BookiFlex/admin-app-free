import { computed } from 'vue'
import { formatMoney } from "../../shared/util.js";

export function useBookingStyleSummary(summaryData) {
    const { currency } = summaryData.value

    const formatModifierName = (code) => {
        const names = {
            'vat': 'VAT',
            'city_tax': 'City tax',
            'city': 'City tax',
            'service_fee': 'Service fee',
            'cleaning_fee': 'Cleaning fee',
            'early_bird': 'Early bird discount',
            'promo': 'Promo code'
        }

        return names[code] || code.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    // Преобразуем breakdown объект в массив для итерации
    const nightsBreakdown = computed(() => {
        if (!summaryData.value?.breakdown) return []

        // Фильтруем и сортируем ключи breakdown для accommodation дней
        return Object.entries(summaryData.value.breakdown)
            .filter(([key, item]) =>
                item.type === 'accommodation' &&
                item.scope === 'daily'
            )
            .sort((a, b) => {
                const dateA = a[1].context.date
                const dateB = b[1].context.date
                return dateA.localeCompare(dateB)
            })
            .map(([key, night]) => {
                const date = night.context.date

                // Находим модификаторы этого дня
                const dayModifiers = summaryData.value.modifiers
                    .filter(mod => {
                        // Проверяем sources объект
                        return Object.values(mod.sources || {}).some(src =>
                            src.type === 'accommodation' &&
                            src.context?.date === date
                        )
                    })
                    .map(mod => {
                        // Находим сумму для этого конкретного дня
                        const daySource = Object.values(mod.sources || {}).find(src =>
                            src.type === 'accommodation' &&
                            src.context?.date === date
                        )

                        return {
                            type: mod.type,
                            code: mod.code,
                            name: formatModifierName(mod.code),
                            amount: daySource?.amount || 0,
                            percentage: mod.adjustmentType === 'PCT' ? mod.value : null
                        }
                    })

                return {
                    date,
                    basePrice: night.subtotal,
                    basePriceFormatted: formatMoney(night.subtotal, currency),
                    modifiers: {
                        taxes: dayModifiers.filter(m => m.type === 'taxes'),
                        charges: dayModifiers.filter(m => m.type === 'charges'),
                        discounts: dayModifiers.filter(m => m.type === 'discounts')
                    },
                    total: night.total,
                    totalFormatted: formatMoney(night.total, currency)
                }
            })
    })

    // Дополнительные услуги из breakdown
    const extras = computed(() => {
        if (!summaryData.value?.breakdown) return []

        return Object.entries(summaryData.value.breakdown)
            .filter(([key, item]) => item.type === 'extra')
            .map(([key, item]) => ({
                code: item.context.code || key,
                name: formatModifierName(item.context.code || key),
                total: item.total,
                totalFormatted: formatMoney(item.total, currency),
                quantity: item.context.quantity || 1,
                refundable: item.context.refundable
            }))
    })

    // Модификаторы уровня резервации
    const reservationModifiers = computed(() => {
        if (!summaryData.value?.modifiers) return { charges: [], discounts: [] }

        const result = {
            charges: [],
            discounts: []
        }

        summaryData.value.modifiers.forEach(mod => {
            // Проверяем, что модификатор относится к резервации
            const isReservationLevel = Object.values(mod.sources || {}).some(src =>
                src.type === 'reservation'
            )

            if (isReservationLevel) {
                const modData = {
                    code: mod.code,
                    name: formatModifierName(mod.code),
                    amount: mod.amount,
                    formatted: formatMoney(Math.abs(mod.amount), currency)
                }

                if (mod.type === 'charges') {
                    result.charges.push(modData)
                } else if (mod.type === 'discounts') {
                    result.discounts.push(modData)
                }
            }
        })

        return result
    })

    // Итоговые суммы из summary
    const totals = computed(() => {
        const summary = summaryData.value?.summary || {}
        return {
            base: summary.base || 0,
            baseFormatted: formatMoney(summary.base || 0, currency),
            taxes: summary.taxes || 0,
            taxesFormatted: formatMoney(summary.taxes || 0, currency),
            charges: summary.charges || 0,
            chargesFormatted: formatMoney(summary.charges || 0, currency),
            discounts: summary.discounts || 0,
            discountsFormatted: formatMoney(summary.discounts || 0, currency)
        }
    })

    // Общая сумма
    const grandTotal = computed(() => ({
        amount: summaryData.value?.total || 0,
        formatted: formatMoney(summaryData.value?.total || 0, currency)
    }))

    return {
        nightsBreakdown,
        extras,
        reservationModifiers,
        totals,
        grandTotal
    }
}
