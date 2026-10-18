<template>
  <div>
    <!-- 顶部阅读进度条：随滚动填充，颜色跟随品牌色，深浅模式通用 -->
    <div class="pointer-events-none fixed left-0 top-0 z-[60] h-[3px] w-full">
      <div
        class="h-full rounded-r-full bg-brand-500 transition-[width] duration-150 ease-out"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>

    <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <!-- 返回列表 -->
      <router-link
        to="/"
        class="mb-5 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-brand-600
               dark:text-slate-400 dark:hover:text-brand-400"
      >
        <el-icon :size="14"><ArrowLeft /></el-icon>
        返回文章列表
      </router-link>

      <div class="flex items-start gap-10">
        <!-- 正文 -->
        <article v-if="post" class="min-w-0 flex-1">
          <header>
            <h1 class="text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-[2.1rem]">
              {{ post.title }}
            </h1>

            <div
              class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500
                     dark:text-slate-400"
            >
              <span class="inline-flex items-center gap-1">
                <el-icon :size="13"><Calendar /></el-icon>
                {{ formatDateCN(post.date) }}
              </span>
              <span>{{ formatReadingTime(post.readingTime) }}</span>
              <Tag v-for="tag in post.tags" :key="tag" :label="tag" size="sm" @click="goTag(tag)" />
            </div>
          </header>

          <!-- 移动端目录：xl 以下用可折叠面板，避免占掉正文宽度 -->
          <details
            v-if="headings.length"
            class="mt-7 rounded-xl border border-slate-200 p-4 dark:border-slate-800 xl:hidden"
          >
            <summary class="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
              目录（{{ headings.length }}）
            </summary>
            <ul class="mt-3 space-y-1.5">
              <li
                v-for="heading in headings"
                :key="heading.id"
                :style="{ paddingLeft: `${(heading.level - 2) * 12}px` }"
              >
                <a
                  href="#"
                  class="block text-sm text-slate-500 transition hover:text-brand-600 dark:hover:text-brand-400"
                  @click.prevent="scrollToHeading(heading.id)"
                >
                  {{ heading.text }}
                </a>
              </li>
            </ul>
          </details>

          <div class="markdown-body mt-8 max-w-content" v-html="html"></div>

          <!-- 文末互动 -->
          <div class="mt-12 rounded-2xl bg-slate-50 p-5 text-center dark:bg-slate-900/60">
            <p class="text-sm text-slate-600 dark:text-slate-400">
              如果这篇文章对你有帮助，欢迎分享给更多人。
            </p>
          </div>
        </article>

        <el-empty v-else description="文章不存在或已被删除" class="flex-1">
          <router-link to="/">
            <el-button type="primary" round>返回首页</el-button>
          </router-link>
        </el-empty>

        <!-- 右侧悬浮目录 -->
        <aside v-if="post && headings.length" class="hidden w-56 shrink-0 xl:block">
          <nav class="sticky top-24">
            <p class="mb-3 text-xs font-medium uppercase tracking-widest text-slate-400">目录</p>
            <ul class="border-l border-slate-200 dark:border-slate-800">
              <li v-for="heading in headings" :key="heading.id">
                <a
                  href="#"
                  class="block border-l-2 py-1 text-sm transition duration-200"
                  :class="[
                    heading.level === 3 ? 'pl-6' : 'pl-3',
                    activeId === heading.id
                      ? '-ml-px border-brand-500 font-medium text-brand-600 dark:text-brand-400'
                      : '-ml-px border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  ]"
                  @click.prevent="scrollToHeading(heading.id)"
                >
                  {{ heading.text }}
                </a>
              </li>
            </ul>
          </nav>
        </aside>
      </div>

      <!-- 上一篇 / 下一篇 -->
      <nav v-if="post" class="mt-10 grid gap-3 sm:grid-cols-2">
        <router-link
          v-if="prev"
          :to="{ name: 'Article', params: { id: prev.id } }"
          class="card p-4"
        >
          <span class="text-xs text-slate-400">上一篇</span>
          <p class="mt-1 line-clamp-2 text-sm font-medium">{{ prev.title }}</p>
        </router-link>
        <span v-else class="hidden sm:block" />

        <router-link
          v-if="next"
          :to="{ name: 'Article', params: { id: next.id } }"
          class="card p-4 sm:text-right"
        >
          <span class="text-xs text-slate-400">下一篇</span>
          <p class="mt-1 line-clamp-2 text-sm font-medium">{{ next.title }}</p>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Calendar } from '@element-plus/icons-vue'
import Tag from '@/components/Tag.vue'
import { getAdjacentPosts, getPostById } from '@/composables/useArticles.js'
import { getHeadings, renderMarkdown } from '@/utils/markdown.js'
import { formatDateCN, formatReadingTime } from '@/utils/format.js'

const route = useRoute()
const router = useRouter()

/** 用 computed：同一路由切换不同 id 时组件复用，也要能重新计算 */
const post = computed(() => getPostById(route.params.id))
const html = computed(() => renderMarkdown(post.value?.content))
const headings = computed(() => getHeadings(post.value?.content))

const adjacent = computed(() => getAdjacentPosts(route.params.id))
const prev = computed(() => adjacent.value.prev)
const next = computed(() => adjacent.value.next)

/** 阅读进度 0-100 */
const progress = ref(0)
/** 当前视口内的标题 id，用于目录高亮 */
const activeId = ref('')

/** 顶部固定区域高度：导航 64 + 进度条余量 */
const OFFSET = 88

function updateProgress() {
  const doc = document.documentElement
  const max = doc.scrollHeight - doc.clientHeight
  progress.value = max > 0 ? Math.min(100, (doc.scrollTop / max) * 100) : 0
}

/** 滚动时找出「最后一个已经滚过顶部」的标题 */
function updateActiveHeading() {
  const list = document.querySelectorAll('.markdown-body h2, .markdown-body h3')
  let current = ''
  list.forEach((el) => {
    if (el.getBoundingClientRect().top <= OFFSET + 24) current = el.id
  })
  if (!current && list.length) current = list[0].id
  activeId.value = current
}

function handleScroll() {
  updateProgress()
  updateActiveHeading()
}

/** 目录点击：手算偏移，避免 hash 模式下去改 location.hash 导致路由跳转 */
function scrollToHeading(id) {
  const el = document.getElementById(id)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - OFFSET
  window.scrollTo({ top, behavior: 'smooth' })
  activeId.value = id
}

function goTag(tag) {
  router.push({ name: 'Tags', query: { tag } })
}

// 切换文章后重新计算一次（等 v-html 渲染完）
watch(
  () => route.params.id,
  () => {
    nextTick(() => {
      updateProgress()
      updateActiveHeading()
    })
  }
)

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  nextTick(handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
