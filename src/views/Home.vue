<template>
  <div class="pb-16 sm:pb-20">
    <!-- ============ 首屏 Hero ============
         负边距让 Hero 从导航底下开始，顶部透明导航才能「浮」在光晕上 -->
    <section class="relative -mt-16 overflow-hidden pt-16">
      <!-- 柔和光晕，纯装饰 -->
      <div class="pointer-events-none absolute inset-0 -z-10">
        <div
          class="absolute left-1/2 top-[-160px] h-[420px] w-[420px] -translate-x-1/2 rounded-full
                 bg-brand-400/25 blur-3xl dark:bg-brand-500/15"
        ></div>
        <div
          class="absolute right-[-80px] top-24 h-[240px] w-[240px] rounded-full
                 bg-sky-300/20 blur-3xl dark:bg-sky-500/10"
        ></div>
      </div>

      <div class="mx-auto max-w-6xl px-4 pb-12 pt-14 text-center sm:px-6 sm:pb-16 sm:pt-20 lg:px-8">
        <img
          :src="profile.avatar"
          :alt="profile.name"
          class="mx-auto h-24 w-24 rounded-full object-cover shadow-lg shadow-brand-500/10
                 ring-4 ring-white sm:h-28 sm:w-28 dark:ring-slate-900"
        />

        <h1 class="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
          你好，我是 {{ profile.name }}
        </h1>
        <p class="mt-2 text-sm text-brand-600 dark:text-brand-400 sm:text-base">{{ profile.title }}</p>
        <p class="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {{ profile.bio[0] }}
        </p>

        <div class="mt-7 flex flex-wrap items-center justify-center gap-3">
          <el-button type="primary" round size="large" @click="scrollToList">开始阅读</el-button>
          <router-link :to="{ name: 'About' }">
            <el-button round size="large">关于我</el-button>
          </router-link>
        </div>

        <!-- 数据统计 -->
        <div class="mt-9 flex items-center justify-center gap-8">
          <div>
            <p class="text-xl font-semibold">{{ total }}</p>
            <p class="mt-0.5 text-xs text-slate-400">篇文章</p>
          </div>
          <span class="h-9 w-px bg-slate-200 dark:bg-slate-800"></span>
          <div>
            <p class="text-xl font-semibold">{{ allTags.length }}</p>
            <p class="mt-0.5 text-xs text-slate-400">个标签</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 文章列表 + 标签侧栏 ============ -->
    <div
      ref="listRef"
      class="mx-auto flex max-w-6xl scroll-mt-24 gap-8 px-4 sm:px-6 lg:px-8"
    >
      <div class="min-w-0 flex-1">
        <div class="mb-5 flex items-end justify-between">
          <h2 class="text-lg font-semibold tracking-tight">最新文章</h2>
          <router-link
            :to="{ name: 'Archive' }"
            class="text-sm text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
          >
            查看归档 →
          </router-link>
        </div>

        <div class="space-y-5">
          <ArticleCard v-for="post in pagedPosts" :key="post.id" :post="post" />
        </div>

        <el-empty v-if="!pagedPosts.length" description="这里还没有文章" />

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="mt-10 flex justify-center">
          <el-pagination
            :current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            :pager-count="isMobile ? 3 : 5"
            :small="isMobile"
            layout="prev, pager, next"
            background
            @current-change="setPage"
          />
        </div>
      </div>

      <!-- 标签侧栏：桌面端显示，移动端隐藏（导航里有独立标签页） -->
      <AppSidebar />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import { allTags, useArticles } from '@/composables/useArticles.js'
import { useIsMobile } from '@/composables/useIsMobile.js'
import { profile } from '@/data/profile.js'

// 每页 5 篇，卡片变大后页面节奏更舒展
const { currentPage, pagedPosts, total, totalPages, pageSize, setPage } = useArticles({
  pageSize: 5
})

const isMobile = useIsMobile()

const listRef = ref(null)

/** Hero 的「开始阅读」滚到文章列表，scroll-mt 已预留导航高度 */
function scrollToList() {
  listRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>
