<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Translations
const t = {
  mo: window.wp.i18n.__('Mo', 'bookiflex'),
  tu: window.wp.i18n.__('Tu', 'bookiflex'),
  we: window.wp.i18n.__('We', 'bookiflex'),
  th: window.wp.i18n.__('Th', 'bookiflex'),
  fr: window.wp.i18n.__('Fr', 'bookiflex'),
  sa: window.wp.i18n.__('Sa', 'bookiflex'),
  su: window.wp.i18n.__('Su', 'bookiflex'),
  removePeriod: window.wp.i18n.__('Remove period', 'bookiflex'),
  addPeriod: window.wp.i18n.__('Add period', 'bookiflex')
}

const emit = defineEmits(['input'])
const ranges = ref([])

const add = () => {
  const dateFrom = ranges.value.length === 0 ? new Date().toISOString().split('T')[0] : ''
  ranges.value.push({
    dateFrom,
    dateTo: '',
    mon: true,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: true,
    sun: true,
  })
}

const remove = () => {
  if (ranges.value.length > 1) {
    ranges.value.pop()
  }
}

const isAddDisabled = computed(
  () => ranges.value.length >= 5 || ranges.value.some((range) => !range.dateFrom || !range.dateTo),
)

const isRemoveDisabled = computed(() => ranges.value.length === 1)

watch(
  ranges,
  () => {
    emit('input', ranges.value)
  },
  { deep: true },
)

onMounted(() => {
  add()
})
</script>

<template>
  <div class="date-range__container">
    <div class="date-range__items">
      <div
        v-for="range in ranges"
        class="date-range__item"
        :key="`${range.dateFrom}-${range.dateTo}`"
      >
        <div class="date-range__dates">
          <sl-input
            :value="range.dateFrom"
            @input="range.dateFrom = $event.target.value"
            type="date"
            value-as-date
            required
          ></sl-input>
          <div class="date-range__separator">-</div>
          <sl-input
            :value="range.dateTo"
            :min="range.dateFrom"
            @input="range.dateTo = $event.target.value"
            type="date"
            value-as-date
            required
          ></sl-input>
        </div>
        <div class="date-range__days">
          <sl-checkbox
            size="small"
            :checked="range.mon"
            @input="range.mon = $event.target.checked"
            >{{ t.mo }}</sl-checkbox
          >
          <sl-checkbox
            size="small"
            :checked="range.tue"
            @input="range.tue = $event.target.checked"
            >{{ t.tu }}</sl-checkbox
          >
          <sl-checkbox
            size="small"
            :checked="range.wed"
            @input="range.wed = $event.target.checked"
            >{{ t.we }}</sl-checkbox
          >
          <sl-checkbox
            size="small"
            :checked="range.thu"
            @input="range.thu = $event.target.checked"
            >{{ t.th }}</sl-checkbox
          >
          <sl-checkbox
            size="small"
            :checked="range.fri"
            @input="range.fri = $event.target.checked"
            >{{ t.fr }}</sl-checkbox
          >
          <sl-checkbox
            size="small"
            :checked="range.sat"
            @input="range.sat = $event.target.checked"
            >{{ t.sa }}</sl-checkbox
          >
          <sl-checkbox
            size="small"
            :checked="range.sun"
            @input="range.sun = $event.target.checked"
            >{{ t.su }}</sl-checkbox
          >
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: end">
      <sl-button
        id="remove-period"
        @click.stop="remove"
        variant="text"
        size="medium"
        :disabled="isRemoveDisabled"
        >{{ t.removePeriod }}</sl-button
      >
      <sl-button
        id="add-period"
        @click.stop="add"
        variant="text"
        size="medium"
        :disabled="isAddDisabled"
        >{{ t.addPeriod }}</sl-button
      >
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
