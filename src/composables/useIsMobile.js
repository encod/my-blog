import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 判断当前是否为窄屏
 * 用于分页器尺寸、栅格列数等需要按屏幕宽度切换的场景
 * @param {number} breakpoint 断点宽度，默认 640px（对应 Tailwind 的 sm）
 */
export function useIsMobile(breakpoint = 640) {
  const isMobile = ref(false)
  let mediaQuery = null

  function handleChange(e) {
    isMobile.value = e.matches
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`)
    isMobile.value = mediaQuery.matches
    mediaQuery.addEventListener('change', handleChange)
  })

  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', handleChange)
  })

  return isMobile
}
