<template>
  <!--
    吸顶导航
    - 页面顶部时透明，滚动超过 8px 后转为白色毛玻璃 + 细边框
    - 用 sticky 而非 fixed，内容不会钻到导航下面
  -->
  <header
    class="sticky top-0 z-50 transition-colors duration-300"
    :class="
      scrolled
        ? 'border-b border-slate-200/70 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85'
        : 'border-b border-transparent bg-transparent'
    "
  >
    <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <!-- Logo：头像 + 站点名 -->
      <router-link to="/" class="flex shrink-0 items-center gap-2.5">
        <img
          :src="avatar"
          alt="站点 Logo"
          class="h-9 w-9 rounded-full object-cover ring-2 ring-brand-500/25 transition duration-300 hover:ring-brand-500/60"
        />
        <span class="text-[15px] font-semibold tracking-tight sm:text-base">前端笔记</span>
      </router-link>

      <!-- PC 导航：当前项下划线高亮 -->
      <nav class="hidden items-center gap-7 md:flex">
        <router-link
          v-for="menu in navMenus"
          :key="menu.name"
          :to="{ name: menu.name }"
          class="nav-item"
          :class="{ 'nav-item-active': isActive(menu.name) }"
        >
          {{ menu.label }}
        </router-link>
      </nav>

      <!-- 右侧操作区 -->
      <div class="flex shrink-0 items-center gap-1">
        <!-- 搜索 -->
        <button type="button" class="icon-button" aria-label="搜索文章" title="搜索文章（Ctrl + K）" @click="searchVisible = true">
          <el-icon :size="18"><Search /></el-icon>
        </button>

        <!-- 深浅色切换 -->
        <button
          type="button"
          class="icon-button"
          :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
          :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
          @click="toggleTheme"
        >
          <Transition name="theme-icon" mode="out-in">
            <el-icon :key="isDark ? 'dark' : 'light'" :size="18">
              <Moon v-if="isDark" />
              <Sunny v-else />
            </el-icon>
          </Transition>
        </button>

        <!-- 移动端汉堡按钮 -->
        <button type="button" class="icon-button md:hidden" aria-label="打开菜单" @click="drawerVisible = true">
          <el-icon :size="20"><Menu /></el-icon>
        </button>
      </div>
    </div>

    <!-- 移动端侧边抽屉 -->
    <el-drawer v-model="drawerVisible" direction="rtl" size="78%" :with-header="false">
      <div class="flex h-full flex-col gap-6 py-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <img :src="avatar" alt="站点 Logo" class="h-9 w-9 rounded-full object-cover" />
            <span class="text-base font-semibold">前端笔记</span>
          </div>
          <button type="button" class="icon-button" aria-label="关闭菜单" @click="drawerVisible = false">
            <el-icon :size="18"><Close /></el-icon>
          </button>
        </div>

        <button type="button" class="drawer-search" @click="openSearchFromDrawer">
          <el-icon :size="15"><Search /></el-icon>
          搜索文章
        </button>

        <nav class="flex flex-col gap-1">
          <router-link
            v-for="menu in navMenus"
            :key="menu.name"
            :to="{ name: menu.name }"
            class="drawer-link"
            :class="{ 'drawer-link-active': isActive(menu.name) }"
            @click="drawerVisible = false"
          >
            {{ menu.label }}
          </router-link>
        </nav>

        <div class="mt-auto flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
          <span class="text-sm text-slate-500 dark:text-slate-400">深色模式</span>
          <el-switch :model-value="isDark" @change="toggleTheme" />
        </div>
      </div>
    </el-drawer>

    <!-- 搜索弹窗 -->
    <SearchDialog v-model="searchVisible" />
  </header>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Close, Menu, Moon, Search, Sunny } from '@element-plus/icons-vue'
import { useTheme } from '@/composables/useTheme.js'
import { navMenus } from '@/router/index.js'
import { profile } from '@/data/profile.js'
import SearchDialog from './SearchDialog.vue'

const route = useRoute()
const { isDark, toggleTheme } = useTheme()

const avatar = profile.avatar
const drawerVisible = ref(false)
const searchVisible = ref(false)

/** 是否已滚动：驱动导航栏从透明到白色 */
const scrolled = ref(false)

function handleScroll() {
  scrolled.value = window.scrollY > 8
}

/** Ctrl / Cmd + K 唤起搜索 */
function handleKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    searchVisible.value = true
  }
}

function openSearchFromDrawer() {
  drawerVisible.value = false
  searchVisible.value = true
}

/** 导航高亮：文章详情页不高亮任何一项 */
function isActive(name) {
  return route.name === name
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleKeydown)
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 导航项：底部下划线由 0 撑开到 100% */
.nav-item {
  @apply relative py-1.5 text-sm text-slate-600 transition-colors duration-200
         hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100;
}

.nav-item::after {
  content: '';
  @apply absolute -bottom-0.5 left-0 h-[2px] w-0 rounded-full bg-brand-500 transition-all duration-200;
}

.nav-item:hover::after {
  @apply w-full;
}

.nav-item-active {
  @apply font-medium text-slate-900 dark:text-slate-100;
}

.nav-item-active::after {
  @apply w-full;
}

.icon-button {
  @apply grid h-10 w-10 place-items-center rounded-lg text-slate-600 transition duration-200
         hover:bg-slate-900/5 hover:text-slate-900 active:scale-95
         dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100 sm:h-9 sm:w-9;
}

.drawer-link {
  @apply rounded-lg px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100
         dark:text-slate-300 dark:hover:bg-slate-800;
}

.drawer-link-active {
  @apply bg-brand-50 font-medium text-brand-600
         dark:bg-brand-500/15 dark:text-brand-400;
}

.drawer-search {
  @apply flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-sm text-slate-500 transition
         hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700;
}
</style>
