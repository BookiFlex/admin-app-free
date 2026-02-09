# @bookiflex/admin-core

Общая библиотека компонентов, composables, утилит и виджетов для BookiFlex Admin (Free и Pro редакций).

## Назначение

`@bookiflex/admin-core` - это shared library, которая предоставляет переиспользуемую функциональность для приложений admin-free и admin-pro. Библиотека экспортируется как ES модуль с поддержкой tree-shaking.

## Что экспортируется

### API Client
REST API функции для взаимодействия с WordPress backend:

```javascript
import {
  loadReservation,
  changeStatus,
  findPayment,
  createCaptureToken,
  loadDateUnitCalendar,
  syncDateUnits,
  updateDateUnits,
  loadQuotaCalendar,
  updateStopSale,
  updateAvailable
} from '@bookiflex/admin-core'
```

### Composables

**Core Composables:**
```javascript
import {
  useDialogs,         // Система модальных диалогов
  useNotifications,   // Система toast-уведомлений
  useDrawer,          // Управление drawer (выдвижные панели)
  useDrawerNavigation, // Навигация между drawer
  useEdition          // Определение версии (free/pro)
} from '@bookiflex/admin-core'
```

**API Composables:**
```javascript
import {
  useApiError         // Обработка API ошибок
} from '@bookiflex/admin-core'
```

**Domain Composables:**
```javascript
import {
  useReservation,         // Работа с резервациями
  usePayment,             // Работа с платежами
  useBookingStyleSummary  // Форматирование бронирования
} from '@bookiflex/admin-core'
```

### Компоненты

**Base Components:**
```javascript
import {
  BaseDrawer,            // Базовый компонент drawer
  DialogComponent,       // Компонент диалога
  NotificationAlert,     // Одиночное уведомление
  NotificationContainer  // Контейнер уведомлений
} from '@bookiflex/admin-core'
```

**Providers:**
```javascript
import {
  DialogProvider,        // Provider для системы диалогов
  NotificationProvider   // Provider для системы уведомлений
} from '@bookiflex/admin-core'
```

**Display Components:**
```javascript
import {
  FinancialSummary,      // Финансовая сводка
  GuestInformation,      // Информация о госте
  PaymentLineCard,       // Строка платежа
  ReservationDetails,    // Детали резервации
  SpecialRequest         // Специальный запрос
} from '@bookiflex/admin-core'
```

**Status Components:**
```javascript
import {
  PaymentStatus,             // Бейдж статуса платежа
  PaymentStatusManager,      // Управление статусом платежа
  PenaltyStatus,             // Бейдж статуса штрафа
  ReservationStatus,         // Бейдж статуса резервации
  ReservationStatusManager   // Управление статусом резервации
} from '@bookiflex/admin-core'
```

### Виджеты

```javascript
import {
  RatePlanCalendar    // Полнофункциональный виджет календаря тарифов
} from '@bookiflex/admin-core'
```

### Константы и утилиты

```javascript
import {
  RESERVATION_STATUS,     // Константы статусов резерваций
  PAYMENT_STATUS,         // Константы статусов платежей
  RESTRICTION_TYPES,      // Типы ограничений календаря
  formatDate,             // Утилиты форматирования
  formatPrice
} from '@bookiflex/admin-core'
```

## Использование

### В приложениях (admin-free/admin-pro)

```vue
<script setup>
// Импорт из admin-core
import {
  useDialogs,
  useNotifications,
  loadReservation,
  DialogProvider,
  NotificationProvider
} from '@bookiflex/admin-core'

const { confirm, alert } = useDialogs()
const { success, error } = useNotifications()

const handleDelete = async (id) => {
  const confirmed = await confirm('Удалить резервацию?', {
    variant: 'danger'
  })

  if (confirmed) {
    try {
      await deleteReservation(id)
      success('Резервация удалена')
    } catch (err) {
      error('Ошибка удаления')
    }
  }
}
</script>

<template>
  <DialogProvider>
    <NotificationProvider>
      <!-- App content -->
    </NotificationProvider>
  </DialogProvider>
</template>
```

### Внутри admin-core (при разработке библиотеки)

```javascript
// Используйте относительные импорты внутри admin-core
import { useNotifications } from '@/composables/core/useNotifications'
import BaseDrawer from '@/components/base/BaseDrawer.vue'
import { loadReservation } from '@/api/api'
```

## Build Process

### Development

В режиме разработки приложения используют Vite alias для прямого доступа к исходникам admin-core:

```javascript
// vite.config.js в admin-free/admin-pro
'@bookiflex/admin-core': path.resolve(__dirname, '../admin-core/src/index.js')
```

Это обеспечивает Hot Module Replacement (HMR) для изменений в admin-core.

### Production

```bash
# Build library
npm run build -w @bookiflex/admin-core
```

Создает оптимизированный ES модуль в `dist/`:

```
dist/
├── index.js          # Main entry point
├── api/
│   └── api.js
├── composables/
│   ├── core/
│   ├── api/
│   └── domain/
├── components/
│   ├── base/
│   ├── providers/
│   ├── display/
│   └── status/
└── widgets/
    └── RatePlanCalendar/
```

**Особенности build:**
- **preserveModules: true** - сохраняет структуру модулей для tree-shaking
- **External dependencies**: vue, @wordpress/i18n, @easepick/bundle и др.
- **Format: ESM** - современный формат модулей

## Tree-Shaking

Библиотека полностью поддерживает tree-shaking. Импортируйте только то, что нужно:

```javascript
// ✅ Правильно - импортируются только нужные модули
import { useDialogs, useNotifications } from '@bookiflex/admin-core'

// ❌ Избегайте default import
import AdminCore from '@bookiflex/admin-core'
```

## Edition Awareness

Библиотека поддерживает работу как с Free, так и с Pro редакциями через composable `useEdition`:

```vue
<script setup>
import { useEdition } from '@bookiflex/admin-core'

const { isPro, isRestrictionAvailable } = useEdition()
</script>

<template>
  <!-- Всегда доступно -->
  <div>Stop Sale</div>

  <!-- Только в Pro -->
  <div v-if="isRestrictionAvailable('minLos')">
    Minimum Length of Stay
  </div>
</template>
```

## Зависимости

### Runtime Dependencies
- `@easepick/bundle` ^1.2.1 - Date picker
- `@hotwired/turbo` - WordPress navigation
- `fecha` ^4.2.3 - Date formatting

### Peer Dependencies
- `vue` ^3.5.0
- `@wordpress/i18n` ^6.6.0

## Документация

Полная документация доступна в директории `docs/`:

- [Architecture](./docs/ARCHITECTURE.md) - Архитектура приложения
- [Dialogs](./docs/DIALOGS.md) - Система диалогов
- [Drawer](./docs/DRAWER.md) - Drawer навигация
- [Events](./docs/EVENTS.md) - Система событий
- [Notifications](./docs/NOTIFICATIONS.md) - Система уведомлений
- [Monorepo](./docs/MONOREPO.md) - Работа с монорепо
- [Widgets](./docs/WIDGETS.md) - Разработка виджетов
- [Edition Features](./docs/EDITION_FEATURES.md) - Free vs Pro различия

### Quick Links

- **API Reference**: [docs/ARCHITECTURE.md#api-layer](./docs/ARCHITECTURE.md#api-layer)
- **Composables Guide**: [docs/ARCHITECTURE.md#composables](./docs/ARCHITECTURE.md#паттерны-разработки)
- **Components**: См. exports в `src/index.js`

## Development

### Добавление нового экспорта

1. Создайте файл в соответствующей директории (`src/composables/`, `src/components/`, и т.д.)
2. Добавьте export в `src/index.js`:

```javascript
// src/index.js
export { useMyComposable } from './composables/core/useMyComposable.js'
export { default as MyComponent } from './components/base/MyComponent.vue'
```

3. Rebuild библиотеки:

```bash
npm run build -w @bookiflex/admin-core
```

### Тестирование изменений

В режиме разработки изменения применяются автоматически благодаря HMR:

```bash
# В одном терминале - запустите dev server приложения
npm run dev:free

# Вносите изменения в admin-core/src/
# Изменения применятся автоматически
```

## Troubleshooting

### Изменения не применяются в dev mode

1. Убедитесь, что Vite alias настроен правильно в `vite.config.js`
2. Перезапустите dev server
3. Очистите кеш браузера

### Build ошибки

```bash
# Очистить dist и пересобрать
rm -rf dist
npm run build
```

### Import ошибки в приложениях

Убедитесь, что:
1. Модуль экспортирован в `src/index.js`
2. Библиотека пересобрана после изменений
3. Используется правильный путь импорта: `@bookiflex/admin-core`

## License

Part of BookiFlex project. См. основной README проекта для лицензионной информации.
