<script setup>
import { ref, computed, watch, onMounted, provide } from 'vue'
import { useGlobalDrawerNavigation } from '../../composables/core/useDrawerNavigation.js'
import { useNotifications } from '../../composables/core/useNotifications.js'
import { useEdition } from '../../composables/core/useEdition.js'
import { useCalendarData } from './composables/useCalendarData.js'
import { useCalendarSync } from './composables/useCalendarSync.js'
import { useDateNavigation } from './composables/useDateNavigation.js'

// Edition features
const { isPro } = useEdition()

// Translations
const t = {
  periodChanged: window.wp.i18n.__('Period changed. Loading data...', 'bookiflex'),
  from: window.wp.i18n.__('From', 'bookiflex'),
  twoWeeks: window.wp.i18n.__('2 weeks', 'bookiflex'),
  oneMonth: window.wp.i18n.__('1 month', 'bookiflex'),
  threeMonths: window.wp.i18n.__('3 month', 'bookiflex'),
  showRestrictions: window.wp.i18n.__('Show restrictions', 'bookiflex'),
  loadingCalendar: window.wp.i18n.__('Loading calendar data...', 'bookiflex'),
  noData: window.wp.i18n.__('No data available. Please check the date range and rate plan.', 'bookiflex')
}

// Компоненты
import CalendarHeader from './components/CalendarHeader.vue'
import CalendarBody from './components/CalendarBody.vue'

const props = defineProps({
  ratePlanId: {
    type: [Number, String],
    default: null
  }
})

// Композаблы
const { navigateTo } = useGlobalDrawerNavigation()
const { success, info } = useNotifications()
const {
  ratePlanInfo,
  accommodationTypes,
  getAccommodationData,
  hasData,
  isLoading,
  loadCalendar,
  syncWithParent,
  reloadCalendar
} = useCalendarData()
const { registerScrollElement } = useCalendarSync()
const {
  dateFrom,
  dateTo,
  dateRange,
  navigateForward,
  navigateBackward,
  setPeriodLength
} = useDateNavigation()

// Локальное состояние
const ratePlanId = ref(props.ratePlanId)
const showRestrictions = ref(false)
const longPeriod = ref('14')

// Provide для дочерних компонентов
provide('registerScrollElement', registerScrollElement)
provide('syncScrollElements', registerScrollElement) // Для обратной совместимости

// Вычисляемые свойства для месяцев
const months = computed(() => {
  const uniqueMonths = []
  dateRange.value.forEach(({ month }) => {
    if (!uniqueMonths.includes(month)) {
      uniqueMonths.push(month)
    }
  })
  return uniqueMonths.length > 1
      ? [uniqueMonths[0], uniqueMonths[uniqueMonths.length - 1]]
      : [uniqueMonths[0]]
})

// Методы навигации по датам
const changeDateFrom = (type) => {
  if (type === 'forward') {
    navigateForward()
  } else if (type === 'back') {
    navigateBackward()
  }
}

// Обработчик изменения периода
const handlePeriodChange = (event) => {
  longPeriod.value = event.target.value
  setPeriodLength(Number(event.target.value))
}

// Загрузка данных
const loadData = async () => {
  if (!ratePlanId.value) return

  await loadCalendar({
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    ratePlan: ratePlanId.value
  })
}

// Обработчик действий из CalendarBody
const handleCalendarAction = async ({ actionType, accommodationType }) => {
  const accommodationInfo = accommodationTypes.value.find(a => a.id === accommodationType)

  switch (actionType) {
    case 'editPrices':
      navigateTo({
        component: 'EditPricesDialog',
        props: {
          accommodationTypes: accommodationTypes.value,
          activeAccommodationType: accommodationType,
          ratePlan: ratePlanId.value,
          onUpdate: handleUpdate
        }
      })
      break

    case 'editRestrictions':
      navigateTo({
        component: 'EditRestrictionsDialog',
        props: {
          accommodationTypes: accommodationTypes.value,
          activeAccommodationType: accommodationType,
          ratePlan: ratePlanId.value,
          onUpdate: handleUpdate
        }
      })
      break

    case 'syncDateUnits':
      const synced = await syncWithParent(
          ratePlanId.value,
          accommodationType,
          accommodationInfo?.name
      )
      if (synced) {
        await loadData()
      }
      break
  }
}

// Обработчик обновления после редактирования
const handleUpdate = async (result) => {
  if (result?.status === 'success') {
    await reloadCalendar({
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      ratePlan: ratePlanId.value
    })
  }
}

// Инициализация
onMounted(() => {
  if (!ratePlanId.value) {
    if (typeof window.pagenow !== 'undefined' && window.pagenow === 'bflex-rate-plan') {
      const postIdElement = document.getElementById('post_ID')
      if (postIdElement) {
        ratePlanId.value = Number(postIdElement.value)
      }
    }
  }

  if (ratePlanId.value) {
    loadData()
  }
})

// Следим за изменениями
watch([dateFrom, dateTo, ratePlanId], () => {
  if (ratePlanId.value) {
    loadData()
  }
})

watch(longPeriod, () => {
  info(t.periodChanged, {
    duration: 2000
  })
})
</script>

<template>
  <div id="rate-plan-calendar-app">
    <!-- Оригинальная панель навигации -->
    <div class="rate-plan-navigation">
      <div class="rate-plan-navigation__date-range">
        <sl-input
            type="date"
            name="dateFrom"
            :value="dateFrom"
            @sl-change="dateFrom = $event.target.value"
            :placeholder="t.from"
            size="small"
        ></sl-input>
        <sl-radio-group
            size="small"
            name="longPeriod"
            :value="longPeriod"
            @sl-change="handlePeriodChange"
            style="margin-left: 0.5em"
        >
          <sl-radio-button value="14">{{ t.twoWeeks }}</sl-radio-button>
          <sl-radio-button value="30">{{ t.oneMonth }}</sl-radio-button>
          <sl-radio-button value="90">{{ t.threeMonths }}</sl-radio-button>
        </sl-radio-group>
        <sl-button-group label="Navigation" style="margin-left: 0.5em">
          <sl-button size="small" @click.stop="changeDateFrom('back')">
            <sl-icon name="arrow-left" label="Back"></sl-icon>
          </sl-button>
          <sl-button size="small" @click.stop="changeDateFrom('forward')">
            <sl-icon name="arrow-right" label="Forward"></sl-icon>
          </sl-button>
        </sl-button-group>
      </div>
      <!-- Переключатель отображения ограничений (только для Pro) -->
      <sl-switch
          v-if="isPro"
          :value="showRestrictions"
          @sl-change="showRestrictions = !!$event.target.checked"
          size="small"
      >{{ t.showRestrictions }}</sl-switch>
    </div>

    <!-- Календарь -->
    <div class="rate-plan-calendar" v-if="hasData">
      <CalendarHeader
          :months-range="months.join(' - ')"
          :date-range="dateRange"
      />

      <template v-for="accommodationType in accommodationTypes" :key="accommodationType.id">
        <CalendarBody
            @action="handleCalendarAction"
            :accommodation-type="accommodationType"
            :date-units="getAccommodationData(accommodationType.id)"
            :date-range="dateRange"
            :inherit-rules="ratePlanInfo?.inheritRules"
            :class="{ 'restriction-visible-hide': !showRestrictions }"
        />
      </template>
    </div>

    <!-- Состояние загрузки -->
    <div v-else-if="isLoading" class="calendar-loading">
      <sl-spinner></sl-spinner>
      <p>{{ t.loadingCalendar }}</p>
    </div>

    <!-- Пустое состояние -->
    <div v-else class="calendar-empty">
      <sl-alert type="info" open>
        <sl-icon slot="icon" name="info-circle"></sl-icon>
        {{ t.noData }}
      </sl-alert>
    </div>
  </div>
</template>

<style lang="scss">
@use '../../assets/css/rate-plan-calendar.scss';
</style>
