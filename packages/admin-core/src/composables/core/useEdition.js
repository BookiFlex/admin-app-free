import { computed } from 'vue'

/**
 * Composable для работы с версией плагина (free/pro)
 * Инкапсулирует логику определения доступных фичей и ограничений
 */
export function useEdition() {
  /**
   * Текущая версия плагина
   */
  const edition = computed(() => window.BookiFlex?.edition || 'free')

  /**
   * Флаги версий
   */
  const isFree = computed(() => edition.value === 'free')
  const isPro = computed(() => edition.value === 'pro')

  /**
   * Доступные ограничения для календаря
   * Free: только StopSale
   * Pro: все ограничения
   */
  const availableRestrictions = computed(() => {
    if (isPro.value) {
      return [
        'stopSale',
        'minLos',
        'maxLos',
        'minLosArrival',
        'maxLosArrival',
        'minAdvBooking',
        'maxAdvBooking',
        'cta',
        'ctd'
      ]
    }
    return ['stopSale']
  })

  /**
   * Проверка доступности конкретного ограничения
   * @param {string} restrictionName - название ограничения
   * @returns {boolean}
   */
  const isRestrictionAvailable = (restrictionName) => {
    return availableRestrictions.value.includes(restrictionName)
  }

  /**
   * Проверка доступности фичи по имени
   * @param {string} featureName - название фичи
   * @returns {boolean}
   */
  const hasFeature = (featureName) => {
    // Можно расширить для других фичей
    const freeFeatures = ['basic_booking', 'single_rate_plan']
    const proFeatures = [
      'basic_booking',
      'single_rate_plan',
      'multiple_rate_plans',
      'advanced_restrictions',
      'channel_manager',
      'advanced_analytics'
    ]

    const features = isPro.value ? proFeatures : freeFeatures
    return features.includes(featureName)
  }

  /**
   * Получить лимит для фичи
   * @param {string} limitName - название лимита
   * @returns {number}
   */
  const getFeatureLimit = (limitName) => {
    const limits = {
      free: {
        rate_plan: 1,
        payment_gateways: 1,
        bookings_per_month: 50,
        email_templates: 5
      },
      pro: {
        rate_plan: -1, // unlimited
        payment_gateways: -1,
        bookings_per_month: -1,
        email_templates: -1
      }
    }

    return limits[edition.value]?.[limitName] ?? 0
  }

  return {
    edition,
    isFree,
    isPro,
    availableRestrictions,
    isRestrictionAvailable,
    hasFeature,
    getFeatureLimit
  }
}
