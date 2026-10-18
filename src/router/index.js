import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * 路由配置
 * 说明：
 * 1. 使用 hash 模式：静态托管（GitHub Pages / 对象存储）刷新不会 404。
 *    若部署环境已配置 rewrite 规则，可改为 createWebHistory(import.meta.env.BASE_URL)。
 * 2. 页面统一懒加载：按路由分包，首屏只加载首页所需代码。
 * 3. 文章详情使用 /:id 并加正则约束，避免误吞 /tags、/about 等静态路径。
 */

/** 顶部导航菜单：AppHeader 直接复用，避免路由名散落两处维护 */
export const navMenus = [
  { name: 'Home', label: '首页' },
  { name: 'Archive', label: '文章归档' },
  { name: 'Tags', label: '标签' },
  { name: 'About', label: '关于' }
]

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/archive',
    name: 'Archive',
    component: () => import('@/views/Archive.vue'),
    meta: { title: '文章归档' }
  },
  {
    path: '/tags',
    name: 'Tags',
    component: () => import('@/views/Tags.vue'),
    meta: { title: '标签分类' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { title: '关于我' }
  },
  {
    // 文章详情：id 仅限字母、数字、下划线、短横线，如 /vue3-reactivity
    path: '/:id([A-Za-z0-9_-]+)',
    name: 'Article',
    component: () => import('@/views/Article.vue'),
    meta: { title: '文章详情' }
  },
  {
    // 兜底 404，必须放在最后
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  /**
   * 滚动行为，按优先级处理三种场景：
   * 1. 带 hash 锚点（如目录跳转）→ 滚到锚点，顶部留出 Header 高度
   * 2. 浏览器前进/后退 → 还原上次滚动位置
   * 3. 普通跳转 → 回到页面顶部
   */
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, top: 80, behavior: 'smooth' }
    }
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

/** 全局后置守卫：统一写入页面标题 */
router.afterEach((to) => {
  const title = to.meta?.title
  document.title = title ? `${title} · 前端笔记` : '前端笔记'
})

/** 懒加载失败兜底：部署更新后旧页面可能请求已失效的 chunk，刷新即可恢复 */
router.onError((error) => {
  if (/Failed to fetch dynamically imported module|Importing a module script failed/i.test(error.message)) {
    window.location.reload()
  }
})

export default router
