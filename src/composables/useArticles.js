import { computed, ref, watch } from 'vue'
import { posts as rawPosts } from '@/data/posts.js'

/**
 * 文章数据层
 * 对外提供三样东西：
 * 1. allPosts / allTags：全局共享的派生数据（模块顶层 computed，多处引用只算一次）
 * 2. getPostById / getAdjacentPosts：详情页取数（模块四使用）
 * 3. useArticles()：列表页的标签筛选 + 分页逻辑
 */

/** 按发布日期倒序排列的全部文章 */
export const allPosts = computed(() =>
  [...rawPosts].sort((a, b) => new Date(b.date) - new Date(a.date))
)

/** 由文章派生的标签列表（含文章数），数量多的排前面 */
export const allTags = computed(() => {
  const counter = new Map()
  allPosts.value.forEach((post) => {
    post.tags.forEach((tag) => counter.set(tag, (counter.get(tag) || 0) + 1))
  })
  return [...counter.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

/** 按 id 取单篇文章，不存在返回 null */
export function getPostById(id) {
  return allPosts.value.find((post) => post.id === id) || null
}

/** 取上下篇（按列表顺序），用于详情页底部导航 */
export function getAdjacentPosts(id) {
  const index = allPosts.value.findIndex((post) => post.id === id)
  if (index === -1) return { prev: null, next: null }
  return {
    prev: allPosts.value[index + 1] || null, // 列表倒序，后一条是更早的文章
    next: allPosts.value[index - 1] || null
  }
}

/**
 * 列表页逻辑：标签筛选 + 分页
 * @param {Object} options
 * @param {number} options.pageSize 每页条数
 * @param {string} options.initialTag 初始选中的标签，空字符串表示全部
 */
export function useArticles({ pageSize = 6, initialTag = '' } = {}) {
  /** 当前页码，从 1 开始 */
  const currentPage = ref(1)
  /** 当前筛选标签，空字符串表示不过滤 */
  const activeTag = ref(initialTag)

  /** 筛选后的文章 */
  const filteredPosts = computed(() => {
    if (!activeTag.value) return allPosts.value
    return allPosts.value.filter((post) => post.tags.includes(activeTag.value))
  })

  const total = computed(() => filteredPosts.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

  /** 当前页要显示的文章 */
  const pagedPosts = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return filteredPosts.value.slice(start, start + pageSize)
  })

  /** 切换标签时重置到第一页，否则会停在一个不存在的页码上 */
  watch(activeTag, () => {
    currentPage.value = 1
  })

  /** 切换页码 */
  function setPage(page) {
    currentPage.value = page
  }

  /** 切换标签 */
  function setTag(tag) {
    activeTag.value = tag || ''
  }

  return {
    currentPage,
    activeTag,
    filteredPosts,
    pagedPosts,
    total,
    totalPages,
    pageSize,
    setPage,
    setTag
  }
}
