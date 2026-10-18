# 数据源改为 HTTP 接口 · 操作文档

当前文章数据来自 `src/data/posts.js`（构建时打包进 bundle 的静态数组）。本文描述如何改为运行时 HTTP 请求，并保证页面层改动最小。

适用版本：Vue 3.5 + Vite 6 + vue-router 4（hash 模式）。

---

## 0. 改造前的现状与影响面

数据流：`posts.js` → `useArticles.js`（派生/筛选/分页）→ 页面。

依赖文章数据的位置共 7 处，改造时逐一处理：

| 文件 | 依赖 | 说明 |
|---|---|---|
| `src/composables/useArticles.js` | `allPosts` / `allTags` / `getPostById` / `getAdjacentPosts` | **核心，必改** |
| `src/views/Home.vue` | `useArticles()`、`allTags` | 加 loading / 错误态 |
| `src/views/Tags.vue` | `useArticles()`、`allTags` | 同上 |
| `src/views/Archive.vue` | `allPosts` | 加 loading / 错误态 |
| `src/views/Article.vue` | `getPostById`、`getAdjacentPosts` | **必改**，详情页要支持异步取数 |
| `src/components/AppSidebar.vue` | `allTags` | 数据为空时不渲染即可 |
| `src/components/SearchDialog.vue` | `allPosts` | 数据为空时禁用搜索 |

改造原则：**只替换数据层，保持 `useArticles()` 的返回字段（`pagedPosts` / `total` / `totalPages` / `setPage` / `setTag`）不变**，这样列表页几乎不用动。

---

## 1. 目标分层

```
页面（Home / Tags / Archive / Article）
        ↓ 只依赖状态与 computed
composables/useArticles.js   ← 缓存、loading、error、筛选、分页
        ↓ 只调用 api 方法
api/posts.js                 ← 接口定义 + 字段适配（adapter）
        ↓
utils/request.js             ← fetch 封装：baseURL、超时、错误
        ↓
后端 / Mock
```

关键点：**不要让页面直接写 `fetch`**，否则以后改接口要翻遍所有页面。

---

## 2. 第一步：先定接口契约（后端对齐后才动手）

前端统一使用这份字段（与现有 `posts.js` 保持一致，页面零改动）：

```ts
Post = {
  id: string          // 唯一，且只能是 [A-Za-z0-9_-]（路由 /:id 有此正则约束）
  title: string
  summary: string
  date: string        // 'YYYY-MM-DD'
  tags: string[]      // 必须是数组。若后端返回 "Vue,JS" 字符串，在 adapter 里切分
  readingTime: number // 分钟
  content: string     // Markdown 正文
}
```

约定响应包装（如果后端已经是裸数组，把 `api/posts.js` 里的 `res.data` 改成 `res` 即可）：

```json
{ "code": 0, "data": [ ... ], "total": 12 }
```

建议接口：

| 方法 | 路径 | 用途 | 备注 |
|---|---|---|---|
| GET | `/posts` | 文章列表（可选 `?tag=`） | 前端分页模式下一次性返回全量 |
| GET | `/posts/:id` | 单篇详情 | 详情页刷新时必需 |
| GET | `/tags` | 标签及计数 | 可选；不提供则由前端从列表派生 |

### 分页模式二选一（先做 A）

- **A. 前端分页（推荐先落地）**：一次拉全量，排序/筛选/分页仍在本地做。`useArticles.js` 的筛选分页逻辑**一行不用改**，只是把数据源从静态数组换成 ref。文章量在几百篇内都够用。
- **B. 服务端分页**：列表接口传 `page` & `pageSize`，返回 `{ list, total }`。适合文章量大或需要服务端搜索。代价是要处理请求竞态，见 §6.3。

---

## 3. 第二步：环境变量与开发代理

新建 `.env.development`：

```bash
VITE_API_BASE=/api
# static | http，回滚开关，见 §9
VITE_DATA_SOURCE=http
```

新建 `.env.production`：

```bash
VITE_API_BASE=https://api.example.com
VITE_DATA_SOURCE=http
```

`vite.config.js` 加开发代理，避免 CORS：

```js
server: {
  port: 5173,
  open: true,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
      // rewrite: (p) => p.replace(/^\/api/, '')   // 后端无 /api 前缀时打开
    }
  }
}
```

> 用相对路径 `/api` 而不是写死域名，生产环境由 Nginx / 网关转发，不用重新打包。

---

## 4. 第三步：请求封装 `src/utils/request.js`（新增）

```js
const BASE_URL = import.meta.env.VITE_API_BASE || '/api'

export class ApiError extends Error {
  constructor(message, { status, data } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * @param {string} path 以 / 开头
 * @param {Object} options
 * @param {Record<string, any>} options.params query 参数，空值自动忽略
 * @param {number} options.timeout 超时毫秒，默认 10s
 * @param {AbortSignal} options.signal 外部取消信号（组件卸载时用）
 */
export async function request(path, { method = 'GET', params, body, timeout = 10000, signal } = {}) {
  const url = new URL(BASE_URL.replace(/\/$/, '') + path, window.location.origin)
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v))
  })

  // 超时用 AbortController 实现；外部 signal 同时生效
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  signal?.addEventListener('abort', () => controller.abort(), { once: true })

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    })
    if (!res.ok) throw new ApiError(`请求失败（${res.status}）`, { status: res.status })
    const json = await res.json()
    // 约定 { code: 0, data }；后端若直接返回数据，把下一行改成 return json
    if (json?.code && json.code !== 0) throw new ApiError(json.message || '接口返回错误', { data: json })
    return json.data
  } finally {
    clearTimeout(timer)
  }
}
```

---

## 5. 第四步：接口层 `src/api/posts.js`（新增）

把「后端字段 → 前端字段」的映射收在这里，后端改字段名时只动这一个文件：

```js
import { request } from '@/utils/request.js'

/** 单篇适配 */
function toPost(raw) {
  if (!raw) return null
  return {
    id: String(raw.id ?? raw.slug ?? ''),
    title: raw.title ?? '',
    summary: raw.summary ?? raw.description ?? '',
    date: (raw.date ?? raw.publishedAt ?? '').slice(0, 10),
    tags: Array.isArray(raw.tags) ? raw.tags : String(raw.tags || '').split(',').map(s => s.trim()).filter(Boolean),
    readingTime: Number(raw.readingTime ?? raw.reading_time ?? 0),
    content: raw.content ?? raw.body ?? ''
  }
}

export function fetchPosts(params) {
  return request('/posts', { params }).then((list) => (Array.isArray(list) ? list : []).map(toPost))
}

export function fetchPost(id) {
  return request(`/posts/${encodeURIComponent(id)}`).then(toPost)
}

/** 可选：后端提供标签接口时用它，否则前端从列表派生 */
export function fetchTags() {
  return request('/tags')
}
```

---

## 6. 第五步：改造 `src/composables/useArticles.js`（核心）

### 6.1 数据源从 computed 换成「异步填充的 ref」

```js
import { computed, ref, watch } from 'vue'
import { fetchPosts } from '@/api/posts.js'
import { posts as staticPosts } from '@/data/posts.js'

const useHttp = import.meta.env.VITE_DATA_SOURCE !== 'static'

/** 全量文章（异步填充）。原来是 computed，现在必须是 ref */
export const allPosts = ref(useHttp ? [] : staticPosts)
export const loading = ref(false)
export const error = ref(null)

/** 进行中的请求，保证并发调用只发一次 */
let inflight = null

/** 幂等取数：已加载过就直接返回，force 可强制刷新 */
export function ensurePosts({ force = false } = {}) {
  if (!useHttp) return Promise.resolve(allPosts.value)
  if (!force && allPosts.value.length) return Promise.resolve(allPosts.value)
  if (inflight) return inflight

  loading.value = true
  error.value = null
  inflight = fetchPosts()
    .then((list) => {
      allPosts.value = [...list].sort((a, b) => new Date(b.date) - new Date(a.date))
      return allPosts.value
    })
    .catch((e) => {
      error.value = e
      throw e
    })
    .finally(() => {
      loading.value = false
      inflight = null
    })
  return inflight
}
```

`allTags` **保持 computed 不变**（依然从 `allPosts` 派生），侧边栏、标签页、搜索框因此无需改逻辑：

```js
export const allTags = computed(() => { /* 原有代码不动 */ })
```

`getPostById` / `getAdjacentPosts` 也保持同步实现不变，但要明白它们的含义变了：**必须等 `ensurePosts()` 完成后调用才有数据**（见 §7.4）。

### 6.2 `useArticles()` 保持对外签名不变

```js
export function useArticles({ pageSize = 6, initialTag = '' } = {}) {
  const currentPage = ref(1)
  const activeTag = ref(initialTag)
  // …原有 filteredPosts / pagedPosts / total / totalPages / watch 重置页码，全部不动

  return { currentPage, activeTag, filteredPosts, pagedPosts, total, totalPages, pageSize,
           setPage, setTag, loading, error }   // 仅多返回 loading / error
}
```

### 6.3 如果选服务端分页（模式 B）

把 `pagedPosts` 改成服务端返回，并**必须处理竞态**（快速连点翻页时，晚返回的旧请求会覆盖新结果）：

```js
const pagedPosts = ref([])
let seq = 0   // 请求序号

async function loadPage() {
  if (!useHttp) return
  const my = ++seq
  loading.value = true
  try {
    const res = await fetchPosts({ page: currentPage.value, pageSize, tag: activeTag.value })
    if (my !== seq) return          // 已有更新的请求，丢弃本次结果
    pagedPosts.value = res.list
    total.value = res.total
  } catch (e) {
    if (my === seq) error.value = e
  } finally {
    if (my === seq) loading.value = false
  }
}

watch([currentPage, activeTag], loadPage, { immediate: true })
```

---

## 7. 第六步：页面改造清单

### 7.1 `Home.vue`

```vue
<script setup>
import { onMounted } from 'vue'
import { allTags, useArticles, ensurePosts, loading, error } from '@/composables/useArticles.js'

const { currentPage, pagedPosts, total, totalPages, pageSize, setPage } = useArticles({ pageSize: 5 })

onMounted(() => { ensurePosts().catch(() => {}) })   // 已在 App 预取则可省略
</script>
```

模板加三态（骨架 / 错误 / 空）：

```vue
<el-skeleton v-if="loading" :rows="3" animated />
<el-alert v-else-if="error" type="error" :title="error.message" show-icon />
<el-empty v-else-if="!pagedPosts.length" description="这里还没有文章" />
<div v-else class="space-y-5">
  <ArticleCard v-for="post in pagedPosts" :key="post.id" :post="post" />
</div>
```

Hero 里的统计数字 `{{ total }}` / `{{ allTags.length }}` 在加载中为 0，可用 `v-if="!loading"` 包住，或显示占位。

### 7.2 `Tags.vue`

同 `Home.vue` 加三态；`activeTag` 由 `route.query.tag` 同步的逻辑不变。

### 7.3 `Archive.vue`

`allPosts` 现在是 ref，模板里 `.length` 写法不变；补 loading / 错误态即可。

### 7.4 `Article.vue`（改动最大，重点）

原来 `computed(() => getPostById(route.params.id))` 是同步的，异步后必须改成：

```js
const post = ref(null)
const detailLoading = ref(true)
let seq = 0

watch(
  () => route.params.id,
  async (id) => {
    const my = ++seq
    detailLoading.value = true
    post.value = null
    try {
      await ensurePosts()                       // 先尝试用列表缓存（通常已命中，不发请求）
      const hit = getPostById(id)
      post.value = hit || (await fetchPost(id)) // 缓存未命中（如直接刷新详情页）才走详情接口
    } catch (e) {
      if (my === seq) post.value = null
    } finally {
      if (my === seq) detailLoading.value = false
    }
  },
  { immediate: true }
)

const adjacent = computed(() => (post.value ? getAdjacentPosts(post.value.id) : { prev: null, next: null }))
```

`post.value` 为 null 且加载结束时，展示「文章不存在」并给返回首页按钮（不要跳 404 路由，避免刷新时误判）。

### 7.5 `AppSidebar.vue` / `SearchDialog.vue`

两者都用了派生数据，`ensurePosts()` 完成后自动更新。只需在 `loading` 时隐藏或置灰：

```vue
<TagList v-if="!loading && tags.length" :tags="tags" />
```

---

## 8. 第七步：后端未就绪时的 Mock 方案（可选）

推荐用 Vite 中间件，零依赖、改动只在 `vite.config.js`：

```js
import { posts } from './src/data/posts.js'

function mockApi() {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use('/api/posts', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ code: 0, data: posts }))
      })
    }
  }
}
// plugins: [vue(), mockApi()]
```

它只在 dev 生效，不影响生产构建。其它可选：`json-server`（独立进程）、`MSW`（拦截 fetch，可复用于测试）。

---

## 9. 第八步：加载时机与回滚开关

**预取**：在 `App.vue` 的 `onMounted` 里调一次 `ensurePosts()`，各页面再调就是命中缓存（同一个 Promise 或已有数据），避免重复请求。

**回滚**：`useArticles.js` 按 `VITE_DATA_SOURCE` 判断，`static` 时直接用 `posts.js`，接口出问题时把 `.env` 改成 `static` 即可回到纯静态，页面无需改动。

---

## 10. 自测清单

**正常流程**
- [ ] 首页首屏出现骨架屏 → 数据到位后渲染卡片，无闪烁跳版
- [ ] 分页翻页、标签筛选结果与静态数据时期一致；切标签后回到第 1 页
- [ ] 详情页正常渲染 Markdown；上下篇链接正确
- [ ] 侧边栏标签计数与首页统计数字正确

**异常流程**
- [ ] 断网 / 后端 500：列表页显示错误提示而不是白屏；恢复后刷新能正常加载
- [ ] 详情页访问不存在的 id：显示「文章不存在」，不抛未捕获异常
- [ ] 快速连点分页：不会出现旧数据覆盖新数据（服务端分页模式必测）
- [ ] 请求超时（10s）：有提示且 `loading` 能结束

**工程与环境**
- [ ] `.env.development` / `.env.production` 分别生效（`import.meta.env.VITE_API_BASE` 打印确认）
- [ ] dev 走代理无 CORS 报错；生产构建后请求地址正确（相对 `/api`）
- [ ] 直接刷新详情页 URL（hash 路由 `#/xxx`）能正常加载
- [ ] 卸载/切路由时无 「组件已卸载仍 setState」 类告警（竞态已处理）

---

## 11. 需要注意的取舍

1. **部署形态变了。** 现在纯静态可直接丢 GitHub Pages / 对象存储；改成运行时 HTTP 后必须有一个 API 服务，或网关转发。
2. **SEO 与首屏。** 静态数据时期 HTML 里就有内容；改为运行时请求后首屏是骨架屏，爬虫抓不到正文。若在意 SEO，需要 SSR（Nuxt）或构建时预取生成静态 JSON（prerender）。
3. **详情页刷新是硬需求。** 列表接口全量返回时，直接打开 `#/xxx` 会先拉列表再命中；文章量大时应单独提供 `/posts/:id`。
4. **id 约束别破。** 后端生成的 id 必须匹配路由正则 `[A-Za-z0-9_-]+`，含中文或斜杠会导致 404 兜底。
5. **缓存失效策略。** 当前 `ensurePosts()` 是「一次加载，长期有效」。若需要更新，后台发布后手动调用 `ensurePosts({ force: true })`，或加 `staleTime` 过期重取。
