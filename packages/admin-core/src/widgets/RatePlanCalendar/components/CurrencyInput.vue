<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String], // Expecting an integer (cents)
    default: 0,
    normalize: (value) => {
      console.log('value', value)
      if (typeof value === 'string') {
        const parsedValue = parseFloat(value.replace(/[^0-9.-]+/g, ''))
        return isNaN(parsedValue) ? 0 : Math.round(parsedValue * 100)
      }
      return Math.round(value * 100)
    },
  },
  currencySymbol: {
    type: String,
    default: 'EUR',
  },
  placeholder: {
    type: String,
    default: 'Enter amount',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const rawValue = ref((props.modelValue / 100).toFixed(2).replace('.', ''))

watch(
  () => props.modelValue,
  (newValue) => {
    rawValue.value = (newValue / 100).toFixed(2).replace('.', '')
  },
)

const formatCurrency = (value) => {
  const numericValue = value.replace(/[^\d]/g, '') // Remove non-numeric characters
  const dollars = numericValue.slice(0, -2) || '0'
  const cents = numericValue.slice(-2).padStart(2, '0')
  return `${dollars}.${cents}`
}

const handleInput = (event) => {
  const input = event.target.value.replace(/[^\d]/g, '') // Keep only digits
  rawValue.value = input
  const parsedValue = parseInt(input || '0', 10)
  emit('update:modelValue', parsedValue)
}

const getCurrencySymbol = (currencyCode, locale = 'en-US') => {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

    // Extract the currency symbol from the formatted string
    const parts = formatter.formatToParts(0)
    const symbolPart = parts.find((part) => part.type === 'currency')
    return symbolPart ? symbolPart.value : null
  } catch (error) {
    console.error(`Error getting currency symbol for code "${currencyCode}":`, error)
    return null
  }
}
</script>

<template>
  <sl-input
    :value="formatCurrency(rawValue)"
    @input="handleInput"
    type="text"
    :placeholder="placeholder"
    :disabled="disabled"
  >
    <div slot="prefix">{{ getCurrencySymbol(currencySymbol) }}</div>
  </sl-input>
</template>
