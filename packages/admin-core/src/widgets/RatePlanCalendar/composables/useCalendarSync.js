import { ref, onUnmounted } from 'vue'

export function useCalendarSync() {
    const scrollElements = ref([])
    const isSyncing = ref(false)
    let animationFrame = null

    /**
     * Обработчик синхронизации скролла с дебаунсом через requestAnimationFrame
     */
    const syncScroll = (event) => {
        if (isSyncing.value) return

        // Отменяем предыдущий запрос анимации если есть
        if (animationFrame) {
            cancelAnimationFrame(animationFrame)
        }

        animationFrame = requestAnimationFrame(() => {
            isSyncing.value = true
            const target = event.target
            const scrollLeft = target.scrollLeft

            scrollElements.value.forEach((el) => {
                if (el !== target) {
                    el.scrollLeft = scrollLeft
                }
            })

            // Сбрасываем флаг после небольшой задержки
            setTimeout(() => {
                isSyncing.value = false
            }, 10)
        })
    }

    /**
     * Регистрация элемента для синхронизации
     */
    const registerScrollElement = (element) => {
        if (!element || scrollElements.value.includes(element)) return

        element.addEventListener('scroll', syncScroll, { passive: true })
        scrollElements.value.push(element)
    }

    /**
     * Удаление элемента из синхронизации
     */
    const unregisterScrollElement = (element) => {
        if (!element) return

        const index = scrollElements.value.indexOf(element)
        if (index > -1) {
            element.removeEventListener('scroll', syncScroll)
            scrollElements.value.splice(index, 1)
        }
    }

    /**
     * Очистка всех слушателей при размонтировании
     */
    const cleanup = () => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame)
        }

        scrollElements.value.forEach((el) => {
            el.removeEventListener('scroll', syncScroll)
        })
        scrollElements.value = []
    }

    // Автоматическая очистка при размонтировании компонента
    onUnmounted(cleanup)

    return {
        registerScrollElement,
        unregisterScrollElement,
        cleanup,
        scrollElements
    }
}
