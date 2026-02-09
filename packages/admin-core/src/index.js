// Turbo (must be imported early to set up global)
export { Turbo } from './turbo.js'

// API
export * from './api/api.js'

// Shared utilities
export * from './shared/constants.js'
export * from './shared/util.js'
export { checkCDNDependencies } from './shared/checkCDNDependencies.js'

// Shoelace components (side-effect: registers custom elements)
export { setBasePath, initShoelace } from './shoelace.js'

// Composables - API
export { useApiError } from './composables/api/useApiError.js'

// Composables - Core
export { useDrawer } from './composables/core/useDrawer.js'
export { useDialogs } from './composables/core/useDialogs.js'
export {
  useNotifications,
  NotificationTypes,
  NotificationPositions,
  initNotificationListeners
} from './composables/core/useNotifications.js'
export { useGlobalDrawerNavigation } from './composables/core/useDrawerNavigation.js'

// Composables - Domain
export { useReservation } from './composables/domain/useReservation.js'
export { usePayment } from './composables/domain/usePayment.js'
export { useBookingStyleSummary } from './composables/domain/useBookingStyleSummary.js'

// Components - Base
export { default as BaseDrawer } from './components/base/BaseDrawer.vue'
export { default as DialogComponent } from './components/base/DialogComponent.vue'
export { default as NotificationAlert } from './components/base/NotificationAlert.vue'
export { default as NotificationContainer } from './components/base/NotificationContainer.vue'

// Components - Providers
export { default as DialogProvider } from './components/providers/DialogProvider.vue'
export { default as NotificationProvider } from './components/providers/NotificationProvider.vue'

// Components - Display
export { default as PaymentLineCard } from './components/display/PaymentLineCard.vue'
export { default as GuestInformation } from './components/display/GuestInformation.vue'
export { default as ReservationDetails } from './components/display/ReservationDetails.vue'
export { default as SpecialRequest } from './components/display/SpecialRequest.vue'
export { default as FinancialSummary } from './components/display/FinancialSummary.vue'

// Components - Status
export { default as ReservationStatusManager } from './components/status/ReservationStatusManager.vue'
export { default as ReservationStatus } from './components/status/ReservationStatus.vue'
export { default as PenaltyStatus } from './components/status/PenaltyStatus.vue'
export { default as PaymentStatusManager } from './components/status/PaymentStatusManager.vue'
export { default as PaymentStatus } from './components/status/PaymentStatus.vue'

// Widgets - RatePlanCalendar
export { default as RatePlanCalendar } from './widgets/RatePlanCalendar/RatePlanCalendar.vue'
export { default as EditPricesDialog } from './widgets/RatePlanCalendar/dialogs/EditPricesDialog.vue'

// Widget components (can be imported individually if needed)
export { default as CalendarHeader } from './widgets/RatePlanCalendar/components/CalendarHeader.vue'
export { default as CalendarBody } from './widgets/RatePlanCalendar/components/CalendarBody.vue'
export { default as CalendarNavigation } from './widgets/RatePlanCalendar/components/CalendarNavigation.vue'
export { default as DateRange } from './widgets/RatePlanCalendar/components/DateRange.vue'
export { default as FormContainer } from './widgets/RatePlanCalendar/components/FormContainer.vue'
export { default as CurrencyInput } from './widgets/RatePlanCalendar/components/CurrencyInput.vue'

// Widget composables
export { useCalendarSync } from './widgets/RatePlanCalendar/composables/useCalendarSync.js'
