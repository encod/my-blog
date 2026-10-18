<template>
  <!-- 纯前端搜索：在已加载的文章数据里做标题 / 摘要 / 标签匹配 -->
  <el-dialog
    v-model="visible"
    :show-close="false"
    width="min(560px, 92vw)"
    align-center
    append-to-body
    @opened="focusInput"
  >
    <div class="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
      <el-icon :size="18" class="shrink-0 text-slate-400"><Search /></el-icon>
      <input
        ref="inputRef"
        v-model="keyword"
        type="text"
        placeholder="搜索标题、摘要或标签…"
        class="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
        @keydown.esc="visible = false"
      />
      <button
        v-if="keyword"
        type="button"
        class="shrink-0 text-xs text-slate-400 transition hover:text-slate-600"
        @click="keyword = ''"
      >
        清空
      </button>
    </div>

    <div class="mt-3 max-h-[52vh] overflow-y-auto">
      <template v-if="keyword.trim()">
        <router-link
          v-for="post in results"
          :key="post.id"
          :to="{ name: 'Article', params: { id: post.id } }"
          class="block rounded-lg px-3 py-2.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
          @click="visible = false"
        >
          <p class="text-sm font-medium">{{ post.title }}</p>
          <p class="mt-0.5 line-clamp-1 text-xs text-slate-400">{{ post.summary }}</p>
        </router-link>

        <p v-if="!results.length" class="py-8 text-center text-sm text-slate-400">
          没有找到与「{{ keyword }}」相关的文章
        </p>
      </template>

      <p v-else class="py-8 text-center text-xs text-slate-400">
        输入关键词开始搜索，支持标题、摘要与标签
      </p>
    </div>

    <p class="mt-2 text-right text-[11px] text-slate-400">共 {{ allPosts.length }} 篇文章</p>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { allPosts } from '@/composables/useArticles.js'

const visible = defineModel({ type: Boolean, default: false })

const keyword = ref('')
const inputRef = ref(null)

/** 关键词匹配：标题、摘要、标签任一命中即可 */
const results = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return []
  return allPosts.value.filter((post) => {
    return (
      post.title.toLowerCase().includes(q) ||
      post.summary.toLowerCase().includes(q) ||
      post.tags.some((tag) => tag.toLowerCase().includes(q))
    )
  })
})

function focusInput() {
  nextTick(() => inputRef.value?.focus())
}

// 关闭时清空关键词，下次打开是干净状态
watch(visible, (open) => {
  if (!open) keyword.value = ''
})
</script>
