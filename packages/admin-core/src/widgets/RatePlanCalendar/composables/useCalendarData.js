import { ref, computed } from 'vue'
import { loadDateUnitCalendar, syncDateUnits } from '../../../api/api.js'
import { useNotifications } from '../../../composables/core/useNotifications.js'
import { useDialogs } from '../../../composables/core/useDialogs.js'

// Translations
const t = {
    failedToLoad: window.wp.i18n.__('Failed to load calendar data', 'bookiflex'),
    syncConfirmMessage: window.wp.i18n.__('This will sync all prices and restrictions with the parent rate plan. Current settings will be overwritten.', 'bookiflex'),
    syncConfirmTitle: window.wp.i18n.__('Sync with parent rate plan', 'bookiflex'),
    sync: window.wp.i18n.__('Sync', 'bookiflex'),
    cancel: window.wp.i18n.__('Cancel', 'bookiflex'),
    syncing: window.wp.i18n.__('Syncing with parent rate plan...', 'bookiflex'),
    syncSuccess: window.wp.i18n.__('Successfully synced with parent rate plan', 'bookiflex'),
    syncFailed: window.wp.i18n.__('Failed to sync with parent rate plan', 'bookiflex'),
    retry: window.wp.i18n.__('Retry', 'bookiflex'),
    refreshing: window.wp.i18n.__('Refreshing calendar data...', 'bookiflex')
}

export function useCalendarData() {
    // Состояние данных
    const calendarData = ref({
        ratePlan: null,
        accommodationTypes: [],
        dateUnits: {}
    })

    const isLoading = ref(false)
    const isSyncing = ref(false)

    // Композаблы
    const { success, error, info } = useNotifications()
    const { confirm } = useDialogs()

    /**
     * Загрузка данных календаря
     */
    const loadCalendar = async (params) => {
        const { dateFrom, dateTo, ratePlan } = params

        if (!dateFrom || !dateTo || !ratePlan) {
            return null
        }

        isLoading.value = true

        try {
            calendarData.value = await loadDateUnitCalendar({
                dateFrom,
                dateTo,
                ratePlan
            })
            // console.log('response:', response)
            // if (response?.status === 'success') {
            //     calendarData.value = response.result
            //     return response.result
            // } else {
            //     throw new Error(response?.message || 'Failed to load calendar')
            // }
        } catch (err) {
            error(t.failedToLoad, {
                duration: 5000
            })
            console.error('Calendar load error:', err)
            return null
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Синхронизация с родительским тарифным планом
     */
    const syncWithParent = async (ratePlanId, accommodationTypeId, accommodationName) => {
        // Подтверждение действия
        const confirmed = await confirm(
            t.syncConfirmMessage,
            {
                title: t.syncConfirmTitle,
                variant: 'warning',
                confirmText: t.sync,
                cancelText: t.cancel
            }
        )

        if (!confirmed) return false

        isSyncing.value = true

        // Показываем уведомление о процессе
        info(t.syncing, {
            duration: 0, // Не закрывается автоматически
            closable: false
        })

        try {
            const response = await syncDateUnits({
                ratePlan: ratePlanId,
                accommodationType: accommodationTypeId
            })

            if (response === 'ok') {
                success(t.syncSuccess, {
                    title: accommodationName,
                    duration: 5000
                })
                return true
            } else {
                throw new Error(response?.message || 'Sync failed')
            }
        } catch (err) {
            error(t.syncFailed, {
                duration: 7000,
                action: {
                    label: t.retry,
                    handler: () => syncWithParent(ratePlanId, accommodationTypeId, accommodationName)
                }
            })
            console.error('Sync error:', err)
            return false
        } finally {
            isSyncing.value = false
        }
    }

    /**
     * Перезагрузка данных календаря
     */
    const reloadCalendar = async (params) => {
        info(t.refreshing, {
            duration: 2000
        })
        return await loadCalendar(params)
    }

    /**
     * Получение данных для конкретного типа размещения
     */
    const getAccommodationData = (accommodationTypeId) => {
        return calendarData.value.dateUnits[accommodationTypeId] || {}
    }

    /**
     * Получение информации о тарифном плане
     */
    const ratePlanInfo = computed(() => calendarData.value.ratePlan)

    /**
     * Список типов размещения
     */
    const accommodationTypes = computed(() => calendarData.value.accommodationTypes || [])

    /**
     * Проверка наличия данных
     */
    const hasData = computed(() => {
        return calendarData.value.accommodationTypes?.length > 0
    })

    return {
        // Данные
        calendarData,
        ratePlanInfo,
        accommodationTypes,
        getAccommodationData,
        hasData,

        // Состояние
        isLoading,
        isSyncing,

        // Методы
        loadCalendar,
        syncWithParent,
        reloadCalendar
    }
}
