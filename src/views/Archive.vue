<template>
  <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
    <header class="mb-10">
      <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">文章归档</h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        共 {{ allPosts.length }} 篇文章，按年份整理
      </p>
    </header>

    <!-- 按年份分组 -->
    <section v-for="group in groups" :key="group.year" class="mb-10 last:mb-0">
      <h2 class="mb-3 flex items-center gap-3 text-lg font-semibold">
        {{ group.year }}
        <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
        <span class="text-xs font-normal text-slate-400">{{ group.posts.length }} 篇</span>
      </h2>

      <ul class="space-y-1">
        <li v-for="post in group.posts" :key="post.id">
          <router-link
            :to="{ name: 'Article', params: { id: post.id } }"
            class="group flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition
                   hover:bg-white hover:shadow-sm dark:hover:bg-slate-900"
          >
            <span class="flex min-w-0 items-center gap-3">
              <span class="hidden w-10 shrink-0 text-xs text-slate-400 sm:block">
                {{ formatDate(post.date).slice(5) }}
              </span>
              <span
                class="truncate text-sm text-slate-700 transition group-hover:text-brand-600
                       dark:text-slate-300 dark:group-hover:text-brand-400"
              >
                {{ post.title }}
              </span>
            </span>
            <span class="shrink-0 text-xs text-slate-400">{{ post.tags[0] }}</span>
          </router-link>
        </li>
      </ul>
    </section>

    <el-empty v-if="!allPosts.length" description="暂无文章" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { allPosts } from '@/composables/useArticles.js'
import { formatDate } from '@/utils/format.js'

/** 按年份分组，年份内保持原有倒序 */
const groups = computed(() => {
  const map = new Map()
  allPosts.value.forEach((post) => {
    const year = post.date.slice(0, 4)
    if (!map.has(year)) map.set(year, [])
    map.get(year).push(post)
  })
  return [...map.entries()].map(([year, posts]) => ({ year, posts }))
})
</script>
