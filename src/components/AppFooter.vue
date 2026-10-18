<template>
  <footer class="mt-auto border-t border-slate-200 dark:border-slate-800">
    <!-- pb 叠加安全区高度，避免 iOS 底部小黑条压住内容 -->
    <div
      class="container-page flex flex-col items-center justify-between gap-3 pt-6
             pb-[calc(1.5rem+env(safe-area-inset-bottom))]
             text-sm text-slate-500 sm:flex-row dark:text-slate-400"
    >
      <!-- 版权信息 -->
      <p>© {{ currentYear }} 前端笔记 · 记录学习与思考</p>

      <!-- 站点链接：替换 href 为自己的主页即可 -->
      <nav class="flex items-center gap-4">
        <a
          v-for="link in links"
          :key="link.label"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          class="transition hover:text-brand-600 dark:hover:text-brand-400"
        >
          {{ link.label }}
        </a>
      </nav>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

/** 版权年份自动跟随当前时间 */
const currentYear = computed(() => new Date().getFullYear())

const links = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: '掘金', href: 'https://juejin.cn' },
  { label: '邮箱', href: 'mailto:your@example.com' }
]
</script>
