<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import { useGlobalDrawerNavigation, EditPricesDialog } from '@bookiflex/admin-core'

// Edition-specific dialogs
import PaymentDetails from '../dialogs/PaymentDetails/PaymentDetails.vue'
import ReservationDetails from '../dialogs/ReservationDetails/ReservationDetails.vue'
import FinancialSummaryDetails from '../dialogs/FinancialSummaryDetails/FinancialSummaryDetails.vue'
import EditRestrictionsDialog from '../dialogs/EditRestrictionsDialog.vue'

// Карта компонентов для динамической загрузки
const componentMap = {
  PaymentDetails,
  ReservationDetails,
  FinancialSummaryDetails,
  EditPricesDialog,      // From admin-core (shared)
  EditRestrictionsDialog // From local dialogs (Free-specific)
}

// Глобальная навигация между drawer'ами
const {
  activeDrawer,
  navigateTo,
  navigateBack,
  closeAll,
  canNavigateBack
} = useGlobalDrawerNavigation()

/**
 * Получить компонент по имени
 */
const currentComponent = computed(() => {
  if (!activeDrawer.value?.component) return null
  return componentMap[activeDrawer.value.component] || null
})

/**
 * Обработчик событий для показа деталей платежа
 */
const handlePaymentDetails = (event) => {
  const { id } = event.detail
  navigateTo({
    component: 'PaymentDetails',
    props: { paymentId: id }
  })
}

/**
 * Обработчик событий для показа деталей резервации
 */
const handleReservationDetails = (event) => {
  const { id } = event.detail
  navigateTo({
    component: 'ReservationDetails',
    props: { reservationId: id }
  })
}

/**
 * Обработчик закрытия drawer'а
 * Закрывает все drawer'ы в стеке
 */
const handleDrawerClose = () => {
  closeAll()
}

/**
 * Обработчик кнопки "Назад"
 * Возвращает к предыдущему drawer'у
 */
const handleDrawerBack = () => {
  if (canNavigateBack()) {
    navigateBack()
  } else {
    closeAll()
  }
}

// Регистрация слушателей событий
onMounted(() => {
  window.addEventListener('bflex:payment:details', handlePaymentDetails)
  window.addEventListener('bflex:reservation:details', handleReservationDetails)
})

// Очистка слушателей при размонтировании
onUnmounted(() => {
  window.removeEventListener('bflex:payment:details', handlePaymentDetails)
  window.removeEventListener('bflex:reservation:details', handleReservationDetails)
})
</script>

<template>
  <div class="bflex-app__container">
    <!-- Динамический рендеринг активного drawer -->
    <component
        v-if="currentComponent && activeDrawer"
        :is="currentComponent"
        v-bind="activeDrawer.props"
        :key="activeDrawer.key"
        @close="handleDrawerClose"
        @back="handleDrawerBack"
    />
  </div>
</template>

<style lang="scss">
@use '../assets/css/index.scss';
</style>