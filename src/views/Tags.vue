<template>
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
    <!-- 标签区 -->
    <section class="card p-5 sm:p-6">
      <h1 class="text-xl font-semibold tracking-tight sm:text-2xl">标签分类</h1>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
        共 {{ allTags.length }} 个标签，点击标签查看对应文章；再次点击可取消筛选
      </p>
      <!-- toggleable：在标签页内点击已选中的标签即取消筛选 -->
      <TagList :tags="allTags" toggleable class="mt-4" />
    </section>

    <!-- 筛选结果 -->
    <div class="mt-6">
      <!-- 已选中标签 -->
      <template v-if="activeTag">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-semibold">
            {{ activeTag }}
            <span class="ml-1 text-sm font-normal text-slate-400">共 {{ total }} 篇</span>
          </h2>
          <el-button size="small" text @click="clearTag">清除筛选</el-button>
        </div>

        <div class="space-y-4">
          <ArticleCard v-for="post in pagedPosts" :key="post.id" :post="post" />
        </div>

        <div v-if="totalPages > 1" class="mt-8 flex justify-center">
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
      </template>

      <!-- 未选中任何标签时的引导 -->
      <el-empty v-else description="选择一个标签，查看对应的文章" />
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import TagList from '@/components/TagList.vue'
import { allTags, useArticles } from '@/composables/useArticles.js'
import { useIsMobile } from '@/composables/useIsMobile.js'

const route = useRoute()
const router = useRouter()
const isMobile = useIsMobile()

// 初始标签取自 URL，保证刷新或从侧边栏跳转过来时筛选状态不丢失
const { activeTag, currentPage, pagedPosts, total, totalPages, pageSize, setPage, setTag } =
  useArticles({
    pageSize: 8,
    initialTag: route.query.tag || ''
  })

/**
 * 同步 URL 上的标签：
 * 侧边栏、卡片上的标签都会 push 到本页并带 query，这里统一收口更新筛选状态
 */
watch(
  () => route.query.tag,
  (tag) => setTag(tag || '')
)

/** 清除筛选：去掉 query，回到未选中状态 */
function clearTag() {
  router.push({ name: 'Tags' })
}
</script>
