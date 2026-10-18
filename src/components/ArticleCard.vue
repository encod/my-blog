<template>
  <!--
    文章卡片
    整卡可点击跳转详情：用 div + role="link" 而非 router-link 包裹，
    这样卡内的标签按钮不会嵌套在 <a> 内部（HTML 不允许交互式元素嵌套），
    同时标签点击可以独立跳转到标签页。
  -->
  <article
    class="card card-interactive group p-4 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:p-5"
    role="link"
    tabindex="0"
    @click="goDetail"
    @keydown.enter="goDetail"
  >
    <!-- 标题：右侧箭头在 hover 时右移，暗示可以点进去 -->
    <div class="flex items-start justify-between gap-3">
      <h2
        class="text-base font-semibold leading-snug transition duration-200 group-hover:text-brand-600
               sm:text-lg dark:group-hover:text-brand-400"
      >
        {{ post.title }}
      </h2>
      <el-icon
        class="mt-0.5 shrink-0 text-slate-300 transition duration-200 group-hover:translate-x-1
               group-hover:text-brand-500 dark:text-slate-600 dark:group-hover:text-brand-400"
        :size="16"
      >
        <ArrowRight />
      </el-icon>
    </div>

    <!-- 简介：最多两行，超出省略 -->
    <p class="line-clamp-2-custom mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
      {{ post.summary }}
    </p>

    <!-- 底部：标签 + 阅读时长 + 发布时间 -->
    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap gap-2">
        <!-- click.stop 阻止冒泡，避免点标签时触发整卡跳转 -->
        <Tag
          v-for="tag in post.tags"
          :key="tag"
          :label="tag"
          size="sm"
          @click.stop="goTag(tag)"
        />
      </div>

      <div class="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
        <span v-if="post.readingTime">{{ formatReadingTime(post.readingTime) }}</span>
        <time :datetime="post.date">{{ formatDate(post.date) }}</time>
      </div>
    </div>
  </article>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import Tag from './Tag.vue'
import { formatDate, formatReadingTime } from '@/utils/format.js'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const router = useRouter()

/** 跳转文章详情：id 即路由参数 */
function goDetail() {
  router.push({ name: 'Article', params: { id: props.post.id } })
}

/** 跳转标签页并带上筛选参数，stop 修饰符阻止冒泡触发卡片跳转 */
function goTag(tag) {
  router.push({ name: 'Tags', query: { tag } })
}
</script>
