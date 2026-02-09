# @bookiflex/admin-free

Vue 3 приложение для админ-панели BookiFlex Free редакции.

## Описание

Приложение Free редакции плагина BookiFlex. Предоставляет базовую функциональность управления бронированиями и резервациями для WordPress админки.

## Особенности Free Edition

### Доступные функции
- Управление резервациями (просмотр, редактирование, изменение статуса)
- Управление платежами
- Календарь тарифных планов с ограничением StopSale
- Финансовая отчетность
- Управление гостями

### Ограничения
- **Календарь тарифов**: доступно только ограничение **Stop Sale**
- **Тарифные планы**: лимит 1 тарифный план
- **Payment Gateways**: лимит 1 платежная система
- **Бронирования**: до 50 в месяц

Для снятия ограничений требуется Pro редакция.

## Разработка

### Запуск dev server

```bash
# Из корня workspace
npm run dev:free

# Или напрямую из пакета
npm run dev
```

Dev server запустится на `http://127.0.0.1:5173` с hot module replacement (HMR).

### Build для production

```bash
# Из корня workspace
npm run build:free

# Или напрямую из пакета
npm run build
```

Build создаст оптимизированные файлы в `dist/` и скопирует их в `/backend/free/assets/admin/` для интеграции с WordPress.

## Структура проекта

```
admin-free/
├── main.js              # Entry point
├── src/
│   ├── app/            # Основное приложение
│   │   ├── RootApp.vue        # Root компонент
│   │   └── AppController.vue  # Главный контроллер
│   ├── dialogs/        # Free-specific dialogs
│   │   ├── ReservationDetails/
│   │   ├── PaymentDetails/
│   │   └── FinancialSummaryDetails/
│   ├── widgets/        # Free-specific widgets (пока пусто)
│   └── assets/         # Free-specific styles
└── dist/               # Build output
```

## Использование admin-core

Приложение зависит от `@bookiflex/admin-core` - shared library с общими компонентами и утилитами.

### Импорт из admin-core

```vue
<script setup>
// Импорт из shared library
import {
  useDialogs,
  useNotifications,
  useEdition,
  loadReservation,
  DialogProvider,
  NotificationProvider,
  RatePlanCalendar
} from '@bookiflex/admin-core'

// Локальные импорты (специфичные для Free)
import { ReservationDetails } from '@dialogs'
import AppController from '@app/AppController.vue'

const { isPro, isRestrictionAvailable } = useEdition()
</script>

<template>
  <DialogProvider>
    <NotificationProvider>
      <!-- App content -->

      <!-- Календарь с Free ограничениями -->
      <RatePlanCalendar />

      <!-- В Free доступен только stopSale -->
      <div v-if="!isRestrictionAvailable('minLos')">
        Upgrade to Pro for advanced restrictions
      </div>
    </NotificationProvider>
  </DialogProvider>
</template>
```

## Path Aliases

```javascript
'@' → './src'
'@app' → './src/app'
'@dialogs' → './src/dialogs'
'@widgets' → './src/widgets'
'@assets' → './src/assets'
'@bookiflex/admin-core' → '../admin-core/src/index.js' (dev)
'@bookiflex/admin-core' → '../admin-core/dist/index.js' (production)
```

## WordPress интеграция

### Development Mode

```php
// WordPress определяет dev mode по константе
if (defined('BOOKIFLEX_FREE_VITE_URL')) {
    // Load from Vite dev server
    wp_enqueue_script(
        'bookiflex-free-admin',
        BOOKIFLEX_FREE_VITE_URL . '/@vite/client',
        [],
        null
    );
}
```

### Production Mode

```php
// Load from manifest.json
$manifest_path = plugin_dir_path(__FILE__) . 'assets/admin/manifest.json';
$manifest = json_decode(file_get_contents($manifest_path), true);

wp_enqueue_script(
    'bookiflex-free-admin',
    plugins_url('assets/admin/' . $manifest['index.js']['file'], __FILE__),
    [],
    $manifest['index.js']['version']
);

wp_enqueue_style(
    'bookiflex-free-admin',
    plugins_url('assets/admin/' . $manifest['index.js']['css'][0], __FILE__),
    [],
    $manifest['index.js']['version']
);
```

### Global Variables

WordPress устанавливает глобальные переменные для приложения:

```javascript
window.BookiFlex = {
  nonce: '<?php echo wp_create_nonce("wp_rest"); ?>',
  edition: 'free',
  i18n: <?php echo json_encode($translations); ?>,
  // ...
}
```

## Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'main.js')
      },
      output: {
        format: 'iife',  // WordPress integration
        entryFileNames: 'index.[hash].js',
        assetFileNames: 'style.[hash].[ext]'
      }
    },
    manifest: true  // Создает manifest.json
  },
  server: {
    port: 5173,
    origin: 'http://127.0.0.1:8888/admin-free'
  },
  define: {
    'process.env.BOOKIFLEX_EDITION': JSON.stringify('free')
  }
})
```

## Edition Detection

Приложение автоматически устанавливает edition при инициализации:

```javascript
// main.js
window.BookiFlex.edition = 'free'

const app = createApp(RootApp)
app.mount('#bflex-root')
```

Внутри компонентов используйте `useEdition`:

```vue
<script setup>
import { useEdition } from '@bookiflex/admin-core'

const { isFree, isPro } = useEdition()
</script>

<template>
  <div v-if="isFree">
    Free Edition Features
  </div>
</template>
```

## Добавление нового диалога

1. Создайте компонент в `src/dialogs/YourDialog/`:

```vue
<!-- src/dialogs/YourDialog/YourDialog.vue -->
<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  // Your props
})

const emit = defineEmits(['resolve', 'cancel'])

const handleSave = () => {
  emit('resolve', result)
}
</script>

<template>
  <div>
    <!-- Dialog content -->
    <button @click="emit('cancel')">Cancel</button>
    <button @click="handleSave">Save</button>
  </div>
</template>
```

2. Экспортируйте из `src/dialogs/index.js`:

```javascript
export { default as YourDialog } from './YourDialog/YourDialog.vue'
```

3. Используйте через dialog service:

```javascript
import { useDialogs } from '@bookiflex/admin-core'
import { YourDialog } from '@dialogs'

const { show } = useDialogs()

await show({
  type: 'custom',
  component: YourDialog,
  componentProps: { /* ... */ }
})
```

## Troubleshooting

### Dev server не запускается

```bash
# Убедитесь, что порт 5173 свободен
lsof -ti:5173 | xargs kill -9

# Перезапустите dev server
npm run dev
```

### HMR не работает

1. Проверьте, что `BOOKIFLEX_FREE_VITE_URL` установлена правильно
2. Откройте консоль браузера на наличие ошибок
3. Перезапустите dev server

### Изменения в admin-core не применяются

Vite alias должен указывать на `../admin-core/src/index.js` в dev mode. Проверьте `vite.config.js`.

## Документация

- [Admin Core Documentation](../admin-core/docs/)
- [Edition Features](../admin-core/docs/EDITION_FEATURES.md)
- [Widget Development](../admin-core/docs/WIDGETS.md)

## License

Part of BookiFlex project. См. основной README проекта для лицензионной информации.
