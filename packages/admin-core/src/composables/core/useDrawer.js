import { ref, nextTick, onUnmounted } from 'vue'

/**
 * Композабл для управления Shoelace drawer компонентами
 * Обеспечивает единообразное управление состоянием drawer и навигацией между ними
 */
export function useDrawer() {
    const drawerRef = ref(null)
    const isVisible = ref(false)
    const navigationStack = ref([])

    /**
     * Показать drawer
     */
    const show = async () => {
        await nextTick()
        if (drawerRef.value) {
            drawerRef.value.show()
            isVisible.value = true
        }
    }

    /**
     * Скрыть drawer
     */
    const hide = async () => {
        if (drawerRef.value) {
            drawerRef.value.hide()
            isVisible.value = false
        }
    }

    /**
     * Закрыть drawer и очистить стек навигации
     */
    const close = () => {
        navigationStack.value = []
        isVisible.value = false
        return true // для обработчика sl-request-close
    }

    /**
     * Навигация к новому drawer с сохранением текущего в стеке
     */
    const navigateTo = async (targetDrawerId, currentDrawerData = null) => {
        if (currentDrawerData) {
            navigationStack.value.push(currentDrawerData)
        }
        await hide()
    }

    /**
     * Вернуться к предыдущему drawer из стека
     */
    const navigateBack = async () => {
        const previousDrawer = navigationStack.value.pop()
        if (previousDrawer) {
            await show()
            return previousDrawer
        }
        return null
    }

    /**
     * Проверить, есть ли возможность вернуться назад
     */
    const canNavigateBack = () => navigationStack.value.length > 0

    // Очистка при размонтировании
    onUnmounted(() => {
        navigationStack.value = []
    })

    return {
        drawerRef,
        isVisible,
        show,
        hide,
        close,
        navigateTo,
        navigateBack,
        canNavigateBack,
        navigationStack
    }
}
