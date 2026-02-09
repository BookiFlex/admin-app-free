<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useEdition } from '../../../composables/core/useEdition.js'

// Edition features
const { isRestrictionAvailable } = useEdition()

// Translations
const t = {
  editPrices: window.wp.i18n.__('Edit prices', 'bookiflex'),
  editRestrictions: window.wp.i18n.__('Edit restrictions', 'bookiflex'),
  syncWithParent: window.wp.i18n.__('Sync with parent', 'bookiflex'),
  stopSale: window.wp.i18n.__('StopSale', 'bookiflex'),
  minLos: window.wp.i18n.__('MinLos', 'bookiflex'),
  maxLos: window.wp.i18n.__('MaxLos', 'bookiflex'),
  minLosArrival: window.wp.i18n.__('MinLos Arrival', 'bookiflex'),
  maxLosArrival: window.wp.i18n.__('MaxLos Arrival', 'bookiflex'),
  minAdvBooking: window.wp.i18n.__('MinAdv Booking', 'bookiflex'),
  maxAdvBooking: window.wp.i18n.__('MaxAdv Booking', 'bookiflex'),
  cta: window.wp.i18n.__('CTA', 'bookiflex'),
  ctd: window.wp.i18n.__('CTD', 'bookiflex')
}

const props = defineProps({
  accommodationType: {
    type: Object,
    required: true
  },
  dateUnits: {
    type: Object,
    default: () => ({})
  },
  dateRange: {
    type: Array,
    default: () => []
  },
  inheritRules: {
    type: Object,
    default: null
  },
  showRestrictions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['action'])

// Получаем функцию регистрации из родителя
const registerScrollElement = inject('registerScrollElement', null)

// Ref для скроллируемого контейнера
const scrollableContainer = ref(null)

// Вычисляемые свойства
const isDateUnitsSet = computed(() => Object.keys(props.dateUnits).length > 0)

// Обработчик действий
const handleAction = (actionType) => {
  emit('action', {
    actionType,
    accommodationType: props.accommodationType.id
  })
}

// Регистрируем элемент для синхронизации скролла
onMounted(() => {
  if (registerScrollElement && scrollableContainer.value) {
    registerScrollElement(scrollableContainer.value)
  }
})
</script>

<template>
  <div class="rate-plan-calendar__body">
    <div class="rate-plan-calendar__body-wrapper">
      <div class="rate-plan-calendar__actions">
        <h2>{{ accommodationType.name }}</h2>
        <div>
          <sl-button
              v-if="accommodationType.isSync || isDateUnitsSet"
              size="small"
              variant="default"
              @click.stop="handleAction('editPrices')"
              outline
          >{{ t.editPrices }}</sl-button>
          <sl-button
              v-if="accommodationType.isSync || isDateUnitsSet"
              size="small"
              variant="default"
              @click.stop="handleAction('editRestrictions')"
              outline
          >{{ t.editRestrictions }}</sl-button>
          <sl-button
              v-if="!accommodationType.isSync"
              size="small"
              variant="warning"
              @click.stop="handleAction('syncDateUnits')"
              outline
          >{{ t.syncWithParent }}</sl-button>
        </div>
      </div>

      <div class="dates-container">
        <div ref="scrollableContainer" class="scroll-container">
          <div class="dates-container__label">
            <div class="dates-container__label-item half"></div>
            <div class="dates-container__label-item" :class="{ inherited: inheritRules?.stopSale }">
              {{ t.stopSale }}
            </div>
            <div
                v-if="isRestrictionAvailable('minLos')"
                class="dates-container__label-item restriction"
                :class="{ inherited: inheritRules?.minLos }"
            >
              {{ t.minLos }}
            </div>
            <div
                v-if="isRestrictionAvailable('maxLos')"
                class="dates-container__label-item restriction"
                :class="{ inherited: inheritRules?.maxLos }"
            >
              {{ t.maxLos }}
            </div>
            <div
                v-if="isRestrictionAvailable('minLosArrival')"
                class="dates-container__label-item restriction"
                :class="{ inherited: inheritRules?.minLosArrival }"
            >
              {{ t.minLosArrival }}
            </div>
            <div
                v-if="isRestrictionAvailable('maxLosArrival')"
                class="dates-container__label-item restriction"
                :class="{ inherited: inheritRules?.maxLosArrival }"
            >
              {{ t.maxLosArrival }}
            </div>
            <div
                v-if="isRestrictionAvailable('minAdvBooking')"
                class="dates-container__label-item restriction"
                :class="{ inherited: inheritRules?.minAdvBooking }"
            >
              {{ t.minAdvBooking }}
            </div>
            <div
                v-if="isRestrictionAvailable('maxAdvBooking')"
                class="dates-container__label-item restriction"
                :class="{ inherited: inheritRules?.maxAdvBooking }"
            >
              {{ t.maxAdvBooking }}
            </div>
            <div
                v-if="isRestrictionAvailable('cta')"
                class="dates-container__label-item restriction"
                :class="{ inherited: inheritRules?.cta }"
            >
              {{ t.cta }}
            </div>
            <div
                v-if="isRestrictionAvailable('ctd')"
                class="dates-container__label-item restriction"
                :class="{ inherited: inheritRules?.ctd }"
            >
              {{ t.ctd }}
            </div>
            <div class="dates-container__label-item half"></div>
            <template v-for="(capacity, index) in accommodationType.capacities" :key="index">
              <div class="dates-container__label-item">{{ capacity.name }}</div>
            </template>
          </div>

          <div class="dates-container__data">
            <div v-for="date in dateRange" class="dates-container__data-item" :key="date.iso8601">
              <div class="day-cell">
                <div class="day-cell__item half"></div>
                <div class="day-cell__item boolean">
                  <span :class="{ active: dateUnits?.[date.iso8601]?.stopSale ?? false }">x</span>
                </div>
                <div v-if="isRestrictionAvailable('minLos')" class="day-cell__item restriction">
                  {{
                    dateUnits?.[date.iso8601]?.minLos === null
                        ? '-'
                        : dateUnits?.[date.iso8601]?.minLos
                  }}
                </div>
                <div v-if="isRestrictionAvailable('maxLos')" class="day-cell__item restriction">
                  {{
                    dateUnits?.[date.iso8601]?.maxLos === null
                        ? '-'
                        : dateUnits?.[date.iso8601]?.maxLos
                  }}
                </div>
                <div v-if="isRestrictionAvailable('minLosArrival')" class="day-cell__item restriction">
                  {{
                    dateUnits?.[date.iso8601]?.minLosArrival === null
                        ? '-'
                        : dateUnits?.[date.iso8601]?.minLosArrival
                  }}
                </div>
                <div v-if="isRestrictionAvailable('maxLosArrival')" class="day-cell__item restriction">
                  {{
                    dateUnits?.[date.iso8601]?.maxLosArrival === null
                        ? '-'
                        : dateUnits?.[date.iso8601]?.maxLosArrival
                  }}
                </div>
                <div v-if="isRestrictionAvailable('minAdvBooking')" class="day-cell__item restriction">
                  {{
                    dateUnits?.[date.iso8601]?.minAdvBooking === null
                        ? '-'
                        : dateUnits?.[date.iso8601]?.minAdvBooking
                  }}
                </div>
                <div v-if="isRestrictionAvailable('maxAdvBooking')" class="day-cell__item restriction">
                  {{
                    dateUnits?.[date.iso8601]?.maxAdvBooking === null
                        ? '-'
                        : dateUnits?.[date.iso8601]?.maxAdvBooking
                  }}
                </div>
                <div v-if="isRestrictionAvailable('cta')" class="day-cell__item restriction boolean">
                  <span :class="{ active: dateUnits?.[date.iso8601]?.cta ?? false }">x</span>
                </div>
                <div v-if="isRestrictionAvailable('ctd')" class="day-cell__item restriction boolean">
                  <span :class="{ active: dateUnits?.[date.iso8601]?.ctd ?? false }">x</span>
                </div>
                <div class="day-cell__item half"></div>

                <div
                    v-for="(capacity, index) in accommodationType.capacities"
                    class="day-cell__item"
                    :key="index"
                >
                  <span
                      :class="{
                      overridden: dateUnits?.[date.iso8601]?.['price']?.['overridden'],
                      inherited: dateUnits?.[date.iso8601]?.['price']?.['inherited'],
                    }"
                  >
                    {{
                      dateUnits?.[date.iso8601]?.['price']?.['value']?.[capacity['scenario']]?.[
                          capacity['variant']
                          ] ?? '-'
                    }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>