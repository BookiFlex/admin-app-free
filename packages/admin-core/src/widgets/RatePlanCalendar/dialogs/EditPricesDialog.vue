<!-- dialogs/RatePlanCalendar/EditPricesDialog.vue -->
<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { updateDateUnits } from '../../../api/api.js'
import { useNotifications } from '../../../composables/core/useNotifications.js'
import BaseDrawer from '../../../components/base/BaseDrawer.vue'
import DateRange from '../components/DateRange.vue'
import CurrencyInput from '../components/CurrencyInput.vue'
import FormContainer from '../components/FormContainer.vue'

// Translations
const t = {
  updatePrices: window.wp.i18n.__('Update prices', 'bookiflex'),
  accommodationType: window.wp.i18n.__('Rental unit', 'bookiflex'),
  onDates: window.wp.i18n.__('On dates', 'bookiflex'),
  applyPrices: window.wp.i18n.__('Apply prices', 'bookiflex'),
  edit: window.wp.i18n.__('Edit', 'bookiflex'),
  editThisPrice: window.wp.i18n.__('Edit this price', 'bookiflex'),
  enterPrice: window.wp.i18n.__('Enter price', 'bookiflex'),
  removePrice: window.wp.i18n.__('Remove price', 'bookiflex'),
  cancel: window.wp.i18n.__('Cancel', 'bookiflex'),
  applyChanges: window.wp.i18n.__('Apply changes', 'bookiflex'),
  pleaseSelectDates: window.wp.i18n.__('Please select dates and at least one price to update', 'bookiflex'),
  pricesUpdated: window.wp.i18n.__('Prices updated successfully', 'bookiflex'),
  failedToUpdate: window.wp.i18n.__('Failed to update prices', 'bookiflex')
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
const prices = ref([])
const isSending = ref(false)

// Вычисляемые свойства
const accommodationType = computed(() => {
  return props.accommodationTypes.find(type => type.id === +selectedAccommodationType.value)
})

const form = computed(() => {
  return {
    ratePlan: props.ratePlan,
    accommodationType: accommodationType.value?.id,
    dates: dateRange.value.filter(date => date.dateFrom && date.dateTo),
    prices: prices.value
        .filter(price => price.active)
        .map(price => ({
          variant: price.variant,
          scenario: price.scenario,
          value: +price.value,
          cancel: !!price.cancel
        }))
  }
})

const isFormValid = computed(() => {
  return form.value.dates.length > 0 && form.value.prices.length > 0
})

// Watchers
watchEffect(() => {
  selectedAccommodationType.value = props.activeAccommodationType.toString()
})

watch(accommodationType, (newType) => {
  if (newType) {
    prices.value = []
    newType.capacities.forEach(capacity => {
      prices.value.push({
        active: false,
        name: capacity.name,
        variant: capacity.variant,
        scenario: capacity.scenario,
        value: '',
        cancel: false
      })
    })
  }
}, { immediate: true })

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
      success(t.pricesUpdated, {
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

    console.error('Price update error:', err)
  } finally {
    isSending.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <BaseDrawer
      :label="t.updatePrices"
      :show-back="false"
      @close="handleClose"
  >
    <FormContainer>
      <form
          @submit.prevent="handleSubmit"
          class="edit-prices-form"
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

        <!-- Настройка цен -->
        <div class="form-section">
          <div class="section-title">{{ t.applyPrices }}</div>

          <fieldset v-for="price in prices" :key="`${price.scenario}-${price.variant}`">
            <legend>{{ price.name }}</legend>
            <div class="price-controls">
              <sl-switch
                  v-model="price.active"
                  size="small"
                  :title="t.editThisPrice"
                  :checked="price.active"
                  :value="price.active"
                  @sl-change="price.active = !!$event.target.checked"
              >
                {{ t.edit }}
              </sl-switch>

              <CurrencyInput
                  v-model="price.value"
                  :disabled="!price.active || price.cancel"
                  :placeholder="t.enterPrice"
                  style="max-width: 150px"
              />

              <sl-checkbox
                  size="small"
                  :disabled="!price.active"
                  :checked="price.cancel"
                  :value="price.cancel"
                  @sl-change="price.cancel = !!$event.target.checked"
              >
                {{ t.removePrice }}
              </sl-checkbox>
            </div>
          </fieldset>
        </div>
      </form>
    </FormContainer>

    <!-- Footer с кнопками -->
    <template #footer>
      <div slot="footer">
        <sl-divider></sl-divider>
        <div class="drawer-footer">
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
    </template>
  </BaseDrawer>
</template>

<style scoped lang="scss">
.edit-prices-form {
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

fieldset {
  border: 1px solid var(--sl-color-neutral-200);
  border-radius: var(--sl-border-radius-medium);
  padding: 1rem;
  margin-bottom: 1rem;

  legend {
    padding: 0 0.5rem;
    font-weight: 500;
    color: var(--sl-color-neutral-700);
  }

  .price-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
}
</style>