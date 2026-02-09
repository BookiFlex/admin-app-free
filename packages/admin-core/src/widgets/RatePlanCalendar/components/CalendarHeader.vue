<script setup>
import { ref, onMounted, inject } from 'vue'

const props = defineProps({
  monthsRange: {
    type: String,
    default: ''
  },
  dateRange: {
    type: Array,
    default: () => []
  }
})

// Получаем функцию регистрации из родителя
const registerScrollElement = inject('registerScrollElement', null)

// Ref для скроллируемого контейнера
const scrollableContainer = ref(null)

// Регистрируем элемент для синхронизации скролла
onMounted(() => {
  if (registerScrollElement && scrollableContainer.value) {
    registerScrollElement(scrollableContainer.value)
  }
})
</script>

<template>
  <div class="rate-plan-calendar__header">
    <div class="rate-plan-calendar__header-wrapper">
      <div class="dates-container">
        <div class="dates-container__month-header">
          <strong>{{ monthsRange }}</strong>
        </div>
        <div ref="scrollableContainer" class="scroll-container">
          <div class="dates-container__label"></div>
          <div class="dates-container__data">
            <div
                v-for="date in dateRange"
                class="dates-container__data-item"
                :key="date.iso8601"
            >
              <div class="day-cell" :title="date.month">
                <div style="font-size: 0.8em; padding: 0.5em">
                  {{ date.weekday }}<br />{{ date.day }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
