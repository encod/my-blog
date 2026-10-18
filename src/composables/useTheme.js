import { ref, watch } from 'vue'

/**
 * 暗黑模式（全局单例）
 * 设计要点：
 * 1. 状态定义在模块顶层，所有组件共用同一个 ref，无需 provide/inject。
 * 2. 主题落在 <html class="dark"> 上，Tailwind 的 dark: 变体与 Element Plus 的
 *    dark/css-vars.css 同时生效，一次切换两处同步。
 * 3. 优先级：本地存储 > 系统偏好；一旦用户手动切换过，就固定跟随用户选择。
 */

const STORAGE_KEY = 'blog-theme'

/** 读取系统偏好 */
function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** 初始化：优先本地存储，其次系统偏好 */
function readInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved === 'dark'
  } catch (e) {
    /* 隐私模式下 localStorage 可能不可用 */
  }
  return prefersDark()
}

const isDark = ref(readInitialTheme())

/** 把主题应用到 <html> */
function applyTheme(dark) {
  const root = document.documentElement
  root.classList.toggle('dark', dark)
  // 同步 color-scheme，让滚动条、表单控件跟随系统渲染
  root.style.colorScheme = dark ? 'dark' : 'light'
}

applyTheme(isDark.value)

// 未手动设置过主题时，跟随系统偏好变化
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', (e) => {
  let hasManualSetting = false
  try {
    hasManualSetting = !!localStorage.getItem(STORAGE_KEY)
  } catch (err) {
    /* 忽略 */
  }
  if (!hasManualSetting) {
    isDark.value = e.matches
  }
})

// 状态变化时同步到 DOM
watch(isDark, (value) => applyTheme(value))

export function useTheme() {
  /** 显式设置主题，并写入本地存储（之后不再跟随系统） */
  function setTheme(dark) {
    isDark.value = dark
    try {
      localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
    } catch (e) {
      /* 忽略写入失败 */
    }
  }

  /** 切换明暗 */
  function toggleTheme() {
    setTheme(!isDark.value)
  }

  return { isDark, setTheme, toggleTheme }
}
