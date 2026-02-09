<!-- widgets/RatePlanCalendar/components/CalendarNavigation.vue -->
<script setup>
import { useEdition } from '../../../composables/core/useEdition.js'

// Edition features
const { isPro } = useEdition()

// Translations
const t = {
  from: window.wp.i18n.__('From', 'bookiflex'),
  previousPeriod: window.wp.i18n.__('Previous period', 'bookiflex'),
  nextPeriod: window.wp.i18n.__('Next period', 'bookiflex'),
  showRestrictions: window.wp.i18n.__('Show restrictions', 'bookiflex')
}

const props = defineProps({
  dateFrom: {
    type: String,
    required: true
  },
  periodLength: {
    type: Number,
    required: true
  },
  periodOptions: {
    type: Array,
    default: () => []
  },
  showRestrictions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:dateFrom',
  'update:periodLength',
  'update:showRestrictions',
  'navigate-forward',
  'navigate-backward'
])

const handleDateChange = (event) => {
  emit('update:dateFrom', event.target.value)
}

const handlePeriodChange = (event) => {
  emit('update:periodLength', Number(event.target.value))
}

const handleRestrictionsToggle = (event) => {
  emit('update:showRestrictions', event.target.checked)
}
</script>

<template>
  <div class="rate-plan-navigation">
    <div class="rate-plan-navigation__controls">
      <!-- Выбор даты -->
      <div class="date-selector">
        <sl-input
            type="date"
            name="dateFrom"
            :value="dateFrom"
            @sl-change="handleDateChange"
            :placeholder="t.from"
            size="small"
        >
          <sl-icon name="calendar" slot="prefix"></sl-icon>
        </sl-input>
      </div>

      <!-- Выбор периода -->
      <sl-radio-group
          size="small"
          name="periodLength"
          :value="periodLength.toString()"
          @sl-change="handlePeriodChange"
      >
        <sl-radio-button
            v-for="option in periodOptions"
            :key="option.value"
            :value="option.value.toString()"
        >
          {{ option.label }}
        </sl-radio-button>
      </sl-radio-group>

      <!-- Кнопки навигации -->
      <sl-button-group label="Navigation">
        <sl-tooltip :content="t.previousPeriod">
          <sl-button
              size="small"
              @click="$emit('navigate-backward')"
              variant="default"
          >
            <sl-icon name="chevron-left" label="Back"></sl-icon>
          </sl-button>
        </sl-tooltip>

        <sl-tooltip :content="t.nextPeriod">
          <sl-button
              size="small"
              @click="$emit('navigate-forward')"
              variant="default"
          >
            <sl-icon name="chevron-right" label="Forward"></sl-icon>
          </sl-button>
        </sl-tooltip>
      </sl-button-group>
    </div>

    <!-- Переключатель отображения ограничений (только для Pro) -->
    <div v-if="isPro" class="rate-plan-navigation__options">
      <sl-switch
          :checked="showRestrictions"
          @sl-change="handleRestrictionsToggle"
          size="small"
      >
        {{ t.showRestrictions }}
      </sl-switch>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rate-plan-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--sl-color-neutral-50);
  border-radius: var(--sl-border-radius-medium);

  &__controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  &__options {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .date-selector {
    sl-input {
      min-width: 150px;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;

    &__controls {
      justify-content: center;
    }

    &__options {
      justify-content: center;
    }
  }
}
</style>
