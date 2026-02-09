import { ref, shallowRef } from 'vue'

/**
 * Композабл для управления навигацией между drawer компонентами
 * Поддерживает стек навигации и плавные переходы
 */
export function useDrawerNavigation() {
    // Текущий активный drawer
    const activeDrawer = shallowRef(null)

    // Стек навигации для возврата
    const navigationStack = ref([])

    // Состояние загрузки
    const isNavigating = ref(false)

    /**
     * Навигация к новому drawer
     * @param {Object} drawerConfig - Конфигурация drawer
     * @param {string} drawerConfig.component - Название компонента
     * @param {Object} drawerConfig.props - Props для компонента
     * @param {boolean} drawerConfig.addToStack - Добавить в стек навигации
     */
    const navigateTo = async (drawerConfig) => {
        isNavigating.value = true

        try {
            // Сохраняем текущий drawer в стек, если нужно
            if (activeDrawer.value && drawerConfig.addToStack !== false) {
                navigationStack.value.push({
                    ...activeDrawer.value,
                    timestamp: Date.now()
                })
            }

            // Устанавливаем новый активный drawer
            activeDrawer.value = {
                component: drawerConfig.component,
                props: drawerConfig.props || {},
                key: drawerConfig.key || `${drawerConfig.component}-${Date.now()}`
            }
        } finally {
            isNavigating.value = false
        }
    }

    /**
     * Вернуться к предыдущему drawer
     */
    const navigateBack = async () => {
        if (!canNavigateBack()) {
            return false
        }

        isNavigating.value = true

        try {
            const previousDrawer = navigationStack.value.pop()
            if (previousDrawer) {
                activeDrawer.value = previousDrawer
                return true
            }
            return false
        } finally {
            isNavigating.value = false
        }
    }

    /**
     * Закрыть все drawer и очистить навигацию
     */
    const closeAll = () => {
        activeDrawer.value = null
        navigationStack.value = []
        isNavigating.value = false
    }

    /**
     * Проверить возможность навигации назад
     */
    const canNavigateBack = () => navigationStack.value.length > 0

    /**
     * Получить глубину стека навигации
     */
    const getNavigationDepth = () => navigationStack.value.length

    /**
     * Заменить текущий drawer без добавления в стек
     */
    const replaceDrawer = async (drawerConfig) => {
        isNavigating.value = true

        try {
            activeDrawer.value = {
                component: drawerConfig.component,
                props: drawerConfig.props || {},
                key: drawerConfig.key || `${drawerConfig.component}-${Date.now()}`
            }
        } finally {
            isNavigating.value = false
        }
    }

    return {
        activeDrawer,
        navigationStack,
        isNavigating,
        navigateTo,
        navigateBack,
        closeAll,
        canNavigateBack,
        getNavigationDepth,
        replaceDrawer
    }
}

/**
 * Глобальный экземпляр для управления навигацией
 */
let globalNavigation = null

export function useGlobalDrawerNavigation() {
    if (!globalNavigation) {
        globalNavigation = useDrawerNavigation()
    }
    return globalNavigation
}