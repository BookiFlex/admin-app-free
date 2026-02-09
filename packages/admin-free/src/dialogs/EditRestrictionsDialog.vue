<script setup>
import { ref, computed, watchEffect } from 'vue'
import {
  updateDateUnits,
  useNotifications,
  BaseDrawer,
  DateRange,
  FormContainer
} from '@bookiflex/admin-core'

// Translations
const t = {
  updateRestrictions: window.wp.i18n.__('Update restrictions', 'bookiflex'),
  accommodationType: window.wp.i18n.__('Rental unit', 'bookiflex'),
  onDates: window.wp.i18n.__('On dates', 'bookiflex'),
  bookingRestrictions: window.wp.i18n.__('Booking restrictions', 'bookiflex'),
  stopSale: window.wp.i18n.__('StopSale', 'bookiflex'),
  minLengthOfStay: window.wp.i18n.__('Minimum Length of Stay', 'bookiflex'),
  maxLengthOfStay: window.wp.i18n.__('Maximum Length of Stay', 'bookiflex'),
  arrivalRestrictions: window.wp.i18n.__('Arrival restrictions', 'bookiflex'),
  minLosOnArrival: window.wp.i18n.__('Min LoS on Arrival', 'bookiflex'),
  maxLosOnArrival: window.wp.i18n.__('Max LoS on Arrival', 'bookiflex'),
  advanceBooking: window.wp.i18n.__('Advance booking', 'bookiflex'),
  minAdvanceBooking: window.wp.i18n.__('Min Advance Booking', 'bookiflex'),
  maxAdvanceBooking: window.wp.i18n.__('Max Advance Booking', 'bookiflex'),
  arrivalDeparture: window.wp.i18n.__('Arrival/Departure', 'bookiflex'),
  closedToArrival: window.wp.i18n.__('Closed to Arrival (CTA)', 'bookiflex'),
  closedToDeparture: window.wp.i18n.__('Closed to Departure (CTD)', 'bookiflex'),
  apply: window.wp.i18n.__('Apply', 'bookiflex'),
  set: window.wp.i18n.__('Set', 'bookiflex'),
  unset: window.wp.i18n.__('Unset', 'bookiflex'),
  days: window.wp.i18n.__('days', 'bookiflex'),
  removeRestriction: window.wp.i18n.__('Remove restriction', 'bookiflex'),
  activeRestrictions: window.wp.i18n.__('Active restrictions will be applied to selected dates', 'bookiflex'),
  cancel: window.wp.i18n.__('Cancel', 'bookiflex'),
  applyChanges: window.wp.i18n.__('Apply changes', 'bookiflex'),
  pleaseSelectDates: window.wp.i18n.__('Please select dates and at least one restriction to update', 'bookiflex'),
  restrictionsUpdated: window.wp.i18n.__('Restrictions updated successfully', 'bookiflex'),
  failedToUpdate: window.wp.i18n.__('Failed to update restrictions', 'bookiflex')
}

const props = defineProps({
  accommodationTypes: {
    type: Array,
    default: () => []
  },
  ratePlan: {
    type: Number,
    required: true
  },
  activeAccommodationType: {
    type: Number,
    required: true
  },
  onUpdate: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['close', 'back'])

// Композаблы
const { success, error, info } = useNotifications()

// Состояние формы
const selectedAccommodationType = ref(props.activeAccommodationType.toString())
const dateRange = ref([])
const isSending = ref(false)

// Ограничения
const restrictions = ref({
  stopSale: {
    active: false,
    value: '1'
  },
  minLos: {
    active: false,
    value: '',
    cancel: false
  },
  maxLos: {
    active: false,
    value: '',
    cancel: false
  },
  minLosArrival: {
    active: false,
    value: '',
    cancel: false
  },
  maxLosArrival: {
    active: false,
    value: '',
    cancel: false
  },
  minAdvBooking: {
    active: false,
    value: '',
    cancel: false
  },
  maxAdvBooking: {
    active: false,
    value: '',
    cancel: false
  },
  cta: {
    active: false,
    value: '1'
  },
  ctd: {
    active: false,
    value: '1'
  }
})

// Вычисляемые свойства
const accommodationType = computed(() => {
  return props.accommodationTypes.find(type => type.id === +selectedAccommodationType.value)
})

const form = computed(() => {
  return {
    ratePlan: props.ratePlan,
    accommodationType: accommodationType.value?.id,
    dates: dateRange.value.filter(date => date.dateFrom && date.dateTo),
    restrictions: Object.keys(restrictions.value)
        .map(key => ({
          name: key,
          active: restrictions.value[key].active,
          value: restrictions.value[key].value,
          cancel: restrictions.value[key].cancel
        }))
        .filter(restriction => restriction.active)
        .reduce((acc, restriction) => {
          acc[restriction.name] = restriction.cancel ? null : +restriction.value
          return acc
        }, {})
  }
})

const isFormValid = computed(() => {
  return form.value.dates.length > 0 && Object.keys(form.value.restrictions).length > 0
})

const hasActiveRestrictions = computed(() => {
  return Object.values(restrictions.value).some(r => r.active)
})

// Watchers
watchEffect(() => {
  selectedAccommodationType.value = props.activeAccommodationType.toString()
})

// Методы
const handleSubmit = async () => {
  if (!isFormValid.value) {
    error(t.pleaseSelectDates)
    return
  }

  isSending.value = true

  try {
    const result = await updateDateUnits(form.value)

    if (result === 'ok') {
      success(t.restrictionsUpdated, {
        duration: 3000
      })

      // Вызываем callback если передан
      if (props.onUpdate) {
        props.onUpdate({ status: 'success' })
      }

      // Закрываем drawer
      emit('close')
    } else {
      throw new Error(result?.message || 'Update failed')
    }
  } catch (err) {
    error(t.failedToUpdate, {
      duration: 5000
    })

    if (props.onUpdate) {
      props.onUpdate({ status: 'fail', message: err.message })
    }

    console.error('Restrictions update error:', err)
  } finally {
    isSending.value = false
  }
}

const handleClose = () => {
  emit('close')
}

// FREE EDITION: Only StopSale restriction available
const restrictionGroups = [
  {
    title: t.bookingRestrictions,
    items: [
      { key: 'stopSale', label: t.stopSale, type: 'toggle' }
    ]
  }
]
</script>

<template>
  <BaseDrawer
      :label="t.updateRestrictions"
      :show-back="false"
      @close="handleClose"
  >
    <FormContainer>
      <form
          @submit.prevent="handleSubmit"
          class="edit-restrictions-form"
      >
        <!-- Выбор типа размещения -->
        <div class="form-section">
          <div class="section-title">{{ t.accommodationType }}</div>
          <sl-select
              v-model="selectedAccommodationType"
              required
          >
            <sl-option
                v-for="type in accommodationTypes"
                :key="type.id"
                :value="type.id.toString()"
            >
              {{ type.name }}
            </sl-option>
          </sl-select>
        </div>

        <!-- Выбор дат -->
        <div class="form-section">
          <div class="section-title">{{ t.onDates }}</div>
          <DateRange @input="dateRange = $event" />
        </div>

        <!-- Настройка ограничений -->
        <div class="form-section">
          <div
              v-for="group in restrictionGroups"
              :key="group.title"
              class="restriction-group"
          >
            <h4>{{ group.title }}</h4>

            <fieldset
                v-for="item in group.items"
                :key="item.key"
            >
              <legend>{{ item.label }}</legend>

              <div class="restriction-controls">
                <!-- Активация ограничения -->
                <sl-switch
                    size="small"
                    :value="restrictions[item.key].active"
                    :checked="restrictions[item.key].active"
                    @sl-change="restrictions[item.key].active = !!$event.target.checked"
                >
                  {{ t.apply }}
                </sl-switch>

                <!-- Для toggle типа - радио кнопки -->
                <sl-radio-group
                    v-if="item.type === 'toggle'"
                    size="small"
                    :value="restrictions[item.key].value"
                    @sl-change="restrictions[item.key].value = $event.target.value"
                >
                  <sl-radio-button value="1" :disabled="!restrictions[item.key].active">
                    {{ t.set }}
                  </sl-radio-button>
                  <sl-radio-button value="0" :disabled="!restrictions[item.key].active">
                    {{ t.unset }}
                  </sl-radio-button>
                </sl-radio-group>

                <!-- Для number типа - input и checkbox отмены -->
                <template v-else-if="item.type === 'number'">
                  <sl-input
                      :value="restrictions[item.key].value"
                      @sl-change="restrictions[item.key].value = $event.target.value"
                      type="number"
                      :min="item.min"
                      :max="item.max"
                      :disabled="!restrictions[item.key].active || restrictions[item.key].cancel"
                      size="small"
                      style="max-width: 100px"
                  >
                    <span slot="suffix">{{ t.days }}</span>
                  </sl-input>

                  <sl-checkbox
                      size="small"
                      :disabled="!restrictions[item.key].active"
                      :value="restrictions[item.key].cancel"
                      :checked="restrictions[item.key].cancel"
                      @sl-change="restrictions[item.key].cancel = !!$event.target.checked"
                  >
                    {{ t.removeRestriction }}
                  </sl-checkbox>
                </template>
              </div>
            </fieldset>
          </div>
        </div>
      </form>
    </FormContainer>

    <!-- Footer с кнопками -->
    <template #footer>
      <div slot="footer">
        <sl-divider></sl-divider>
        <div class="drawer-footer">
          <div class="footer-hint" v-if="hasActiveRestrictions">
            <sl-icon name="info-circle"></sl-icon>
            {{ t.activeRestrictions }}
          </div>
          <div class="footer-actions">
            <sl-button
                variant="default"
                @click="handleClose"
            >
              {{ t.cancel }}
            </sl-button>
            <sl-button
                variant="primary"
                :loading="isSending"
                :disabled="!isFormValid"
                @click="handleSubmit"
            >
              {{ t.applyChanges }}
            </sl-button>
          </div>
        </div>
      </div>
    </template>
  </BaseDrawer>
</template>

<style scoped lang="scss">
.edit-restrictions-form {
  padding: 1rem;
}

.form-section {
  margin-bottom: 1.5rem;

  .section-title {
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--sl-color-neutral-900);
  }
}

.restriction-group {
  margin-bottom: 1.5rem;

  h4 {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    margin-bottom: 16px;
    display: block;
  }
}

fieldset {
  border: 1px solid var(--sl-color-neutral-200);
  border-radius: var(--sl-border-radius-medium);
  padding: 1rem;
  margin-bottom: 0.75rem;

  legend {
    padding: 0 0.5rem;
    font-weight: 500;
    color: var(--sl-color-neutral-700);
    font-size: 0.9rem;
  }

  .restriction-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
}

.drawer-footer {
  padding: 1rem;

  .footer-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: var(--sl-color-primary-50);
    border-radius: var(--sl-border-radius-small);
    color: var(--sl-color-primary-700);
    font-size: 0.875rem;

    sl-icon {
      flex-shrink: 0;
    }
  }

  .footer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}
</style>