/**
 * Проверка наличия критических CDN-зависимостей
 *
 * Проверяет, что все необходимые библиотеки, загружаемые через CDN,
 * доступны в глобальной области видимости перед инициализацией приложения.
 *
 * Note: Turbo is now bundled via NPM (@hotwired/turbo) and initialized in turbo.js
 *
 * @throws {Error} Если критические зависимости не найдены
 */
export const checkCDNDependencies = () => {
  const missing = []

  // Проверка Vue (загружается через CDN)
  if (typeof window.Vue === 'undefined') {
    missing.push('Vue.js (window.Vue)')
  }

  // Проверка WordPress i18n (загружается WordPress ядром)
  if (typeof window.wp === 'undefined' || typeof window.wp.i18n === 'undefined') {
    missing.push('WordPress i18n (window.wp.i18n)')
  }

  if (missing.length > 0) {
    const error = `[BookiFlex] Critical dependencies not loaded from CDN:\n- ${missing.join('\n- ')}\n\nPlease ensure CDN scripts are loaded before this application.`
    console.error(error)
    throw new Error(error)
  }
}
