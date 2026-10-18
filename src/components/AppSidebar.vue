<template>
  <!--
    侧边栏：仅桌面端显示（lg 以上）
    移动端隐藏，标签改由 AppHeader 的抽屉展示
  -->
  <aside class="hidden w-64 shrink-0 lg:block">
    <div class="space-y-4 lg:sticky lg:top-24">
      <section class="card p-4">
        <h2 class="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <el-icon :size="15"><Collection /></el-icon>
          标签
        </h2>
        <TagList :tags="tags" />
      </section>
    </div>
  </aside>
</template>

<script setup>
import { Collection } from '@element-plus/icons-vue'
import TagList from './TagList.vue'
// 标签由文章数据自动派生，新增文章后侧边栏无需手动维护
import { allTags as tags } from '@/composables/useArticles.js'
</script>
