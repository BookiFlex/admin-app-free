# Core Composables

## useEdition

Composable для работы с версией плагина (free/pro) и проверки доступности фичей.

### Использование

```vue
<script setup>
// Используйте относительный путь в зависимости от расположения вашего файла
// Пример для файлов в src/widgets/*:
import { useEdition } from '../../composables/core/useEdition.js'

const {
  edition,               // 'free' | 'pro'
  isFree,                // computed boolean
  isPro,                 // computed boolean
  isRestrictionAvailable,
  hasFeature,
  getFeatureLimit
} = useEdition()
</script>

<template>
  <!-- Условный рендеринг на основе версии -->
  <div v-if="isPro" class="pro-feature">
    Pro feature content
  </div>

  <!-- Проверка доступности конкретного ограничения -->
  <div v-if="isRestrictionAvailable('minLos')" class="restriction">
    {{ t.minLos }}
  </div>

  <!-- Проверка доступности фичи -->
  <button v-if="hasFeature('advanced_analytics')">
    Advanced Analytics
  </button>
</template>
```

### API

#### `edition`
- **Тип**: `ComputedRef<'free' | 'pro'>`
- **Описание**: Текущая версия плагина

#### `isFree`
- **Тип**: `ComputedRef<boolean>`
- **Описание**: Флаг free версии

#### `isPro`
- **Тип**: `ComputedRef<boolean>`
- **Описание**: Флаг pro версии

#### `availableRestrictions`
- **Тип**: `ComputedRef<string[]>`
- **Описание**: Массив доступных ограничений для текущей версии
- **Free**: `['stopSale']`
- **Pro**: `['stopSale', 'minLos', 'maxLos', 'minLosArrival', 'maxLosArrival', 'minAdvBooking', 'maxAdvBooking', 'cta', 'ctd']`

#### `isRestrictionAvailable(restrictionName)`
- **Параметры**:
  - `restrictionName: string` - название ограничения
- **Возвращает**: `boolean`
- **Описание**: Проверяет доступность конкретного ограничения

#### `hasFeature(featureName)`
- **Параметры**:
  - `featureName: string` - название фичи
- **Возвращает**: `boolean`
- **Описание**: Проверяет доступность фичи по имени

#### `getFeatureLimit(limitName)`
- **Параметры**:
  - `limitName: string` - название лимита
- **Возвращает**: `number`
- **Описание**: Возвращает лимит для фичи (-1 = unlimited)

### Примеры

#### Скрытие ограничений в календаре (Free версия)

```vue
<script setup>
import { useEdition } from '../../../composables/core/useEdition.js'

const { isRestrictionAvailable } = useEdition()
</script>

<template>
  <!-- StopSale всегда доступен -->
  <div class="restriction">{{ t.stopSale }}</div>

  <!-- Остальные только для Pro -->
  <div v-if="isRestrictionAvailable('minLos')" class="restriction">
    {{ t.minLos }}
  </div>

  <div v-if="isRestrictionAvailable('maxLos')" class="restriction">
    {{ t.maxLos }}
  </div>
</template>
```

#### Проверка лимитов

```vue
<script setup>
import { useEdition } from '../../composables/core/useEdition.js'

const { getFeatureLimit, isPro } = useEdition()

const ratePlanLimit = getFeatureLimit('rate_plan')
const canAddMoreRatePlans = computed(() => {
  const limit = ratePlanLimit.value
  return limit === -1 || currentRatePlans.value.length < limit
})
</script>

<template>
  <button v-if="canAddMoreRatePlans">
    Add Rate Plan
  </button>
  <div v-else-if="!isPro" class="upgrade-notice">
    Upgrade to Pro for unlimited rate plans
  </div>
</template>
```

### Принципы использования

1. **Централизация логики**: Вся версионная логика находится в одном месте
2. **Инкапсуляция**: Прямой доступ к `window.BookiFlex.edition` скрыт
3. **Тестируемость**: Composable легко мокать в тестах
4. **Расширяемость**: Легко добавлять новые фичи и проверки
5. **Декларативность**: Код становится более читаемым и понятным

### Добавление новых фичей

Для добавления новых фичей отредактируйте `useEdition.js`:

```js
const hasFeature = (featureName) => {
  const freeFeatures = ['basic_booking', 'single_rate_plan', 'your_new_feature']
  const proFeatures = [
    'basic_booking',
    'single_rate_plan',
    'your_new_feature',
    'pro_exclusive_feature'
  ]

  const features = isPro.value ? proFeatures : freeFeatures
  return features.includes(featureName)
}
```