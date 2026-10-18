/**
 * 文章数据（模拟源）
 * 字段说明：
 * - id：文章唯一标识，同时作为路由 /:id 的参数，只能用字母、数字、下划线、短横线
 * - title：标题
 * - summary：列表页展示的简介
 * - date：发布日期，列表按此倒序
 * - tags：标签，侧边栏与标签页的标签由该字段自动派生
 * - readingTime：预计阅读时长（分钟）
 * - content：正文 Markdown，模块四渲染详情页时使用
 *
 * 后续若接入真实 Markdown 文件，只需保证导出结构一致即可，上层逻辑不用改。
 */
export const posts = [
  {
    id: 'vue3-reactivity-principle',
    title: 'Vue3 响应式原理：Proxy 到底做了什么',
    summary:
      '从 Object.defineProperty 到 Proxy，梳理 Vue3 响应式的实现差异，并手写一份mini-reactive 理解依赖收集与派发更新。',
    date: '2026-10-12',
    tags: ['Vue', 'JavaScript'],
    readingTime: 12,
    content: `## 为什么换成 Proxy

Vue2 使用 \`Object.defineProperty\` 拦截属性的读写，但它有三个硬伤：
无法监听新增/删除属性、无法监听数组下标与长度变化、需要递归遍历整个对象。

Proxy 直接代理整个对象，拦截的是「操作」而不是「某个属性」。

## 手写 mini-reactive

\`\`\`js
const effectStack = []
function reactive(target) {
  return new Proxy(target, {
    get(obj, key) {
      track(obj, key)
      return obj[key]
    },
    set(obj, key, value) {
      obj[key] = value
      trigger(obj, key)
      return true
    }
  })
}
\`\`\`

核心只有两件事：**读取时收集依赖，修改时触发依赖**。`
  },
  {
    id: 'vue3-composition-api-best-practice',
    title: 'Composition API 实践：如何拆分才不算白写',
    summary:
      '组合式 API 用不好就会变成更长的 setup。总结三种拆分粒度：按功能、按状态、按生命周期，以及 composable 的命名约定。',
    date: '2026-10-05',
    tags: ['Vue', '工程化'],
    readingTime: 9,
    content: `## 三种拆分粒度

1. **按功能**：如 \`useTheme\`、\`useArticles\`，输入参数返回状态与方法
2. **按状态**：把一组相关的 ref 与修改逻辑收拢
3. **按生命周期**：订阅、清理副作用成对出现

## 约定

- 文件名与导出函数名保持一致：\`useXxx.js\` → \`useXxx()\`
- 只暴露调用方需要的部分，内部实现不导出
- 依赖外部状态时用参数传入，不在函数内部直接 import 单例`
  },
  {
    id: 'git-rebase-vs-merge',
    title: 'Git rebase 与 merge 的区别，一次讲清',
    summary:
      '用图解释两条命令对提交历史的影响，什么场景该用 rebase，什么时候坚决不能用，以及 rebase 后如何安全推送。',
    date: '2026-09-28',
    tags: ['Git'],
    readingTime: 8,
    content: `## 核心区别

\`merge\` 会保留两条分支的完整历史并生成一个新的合并提交；
\`rebase\` 则把当前分支的提交「摘下来」重新接到目标分支后面，历史变成一条直线。

## 什么时候用

- 本地分支同步主干：用 \`rebase\`，历史干净
- 合并公共分支：用 \`merge\`，保留真实合并点
- **已经推送到远程并被他人使用的分支，不要 rebase**

## 常用命令

\`\`\`bash
git rebase -i HEAD~3      # 交互式整理最近三次提交
git pull --rebase origin main
\`\`\``
  },
  {
    id: 'git-commit-convention',
    title: '提交信息怎么写才不挨骂：Conventional Commits',
    summary:
      'feat、fix、refactor 到底怎么区分，scope 要不要写，以及如何用 commitlint 在提交阶段自动校验。',
    date: '2026-09-20',
    tags: ['Git', '工程化'],
    readingTime: 6,
    content: `## 格式

\`\`\`
<type>(<scope>): <subject>
\`\`\`

常用 type：

- \`feat\`：新功能
- \`fix\`：修复缺陷
- \`refactor\`：重构，既不加功能也不修 bug
- \`docs\`、\`style\`、\`test\`、\`chore\`

## 自动校验

\`\`\`bash
npm i -D @commitlint/cli @commitlint/config-conventional husky
npx husky add .husky/commit-msg 'npx --no-install commitlint --edit $1'
\`\`\``
  },
  {
    id: 'ai-coding-workflow',
    title: 'AI 编码工作流：让大模型当副驾而不是司机',
    summary:
      '把 AI 用在需求拆解、代码评审、重构成三个环节的具体做法，以及如何写出一段能拿回可用代码的提示词。',
    date: '2026-10-08',
    tags: ['AI 编码'],
    readingTime: 11,
    content: `## 三个高价值环节

1. **需求拆解**：让 AI 列出实现步骤与边界条件，人工确认后再动手
2. **代码评审**：贴 diff，让它按「正确性 / 性能 / 可维护性」三个维度挑问题
3. **重构**：给旧代码加约束（保持 API 不变、不要改依赖），让它逐步改写

## 提示词要点

给足上下文：技术栈、目标文件、现有约定、不要做什么。
模糊的需求只会换来一段看起来对、跑不起来的代码。`
  },
  {
    id: 'ai-code-review-checklist',
    title: '用 AI 做 Code Review 的检查清单',
    summary:
      '整理了一份可直接复用的评审提示词模板，覆盖空值处理、并发、错误边界、可访问性等容易漏掉的点。',
    date: '2026-09-30',
    tags: ['AI 编码', '工程化'],
    readingTime: 7,
    content: `## 可直接复用的模板

> 以下是待评审的代码改动，请按以下顺序给出问题清单：
> 1. 逻辑正确性与边界条件
> 2. 空值、异常、并发处理
> 3. 性能与重复计算
> 4. 可读性与命名
> 只列出真正的问题，按严重程度排序，并给出修改建议。

## 注意

AI 容易漏掉业务上下文相关的错误，最终结论仍要人工把关。`
  },
  {
    id: 'interview-event-loop',
    title: '面试题：一道 setTimeout 与 Promise 混合题',
    summary:
      '从宏任务微任务讲到事件循环的完整流程，附一张执行顺序推演表，看完不再靠背结论。',
    date: '2026-10-02',
    tags: ['面试', 'JavaScript', '浏览器'],
    readingTime: 10,
    content: `## 结论先行

同步代码 → 清空微任务队列 → 取一个宏任务 → 再清空微任务 → 循环。

## 推演示例

\`\`\`js
console.log('1')
setTimeout(() => console.log('2'))
Promise.resolve().then(() => console.log('3'))
console.log('4')
// 输出：1 4 3 2
\`\`\`

微任务包含 \`Promise.then\`、\`queueMicrotask\`、\`MutationObserver\`；
宏任务包含 \`setTimeout\`、\`setInterval\`、I/O、UI 渲染。`
  },
  {
    id: 'interview-css-center',
    title: '面试题：CSS 居中的六种写法与适用场景',
    summary:
      'flex、grid、absolute + transform、line-height… 按「是否知道子元素尺寸」和「是否需要脱离文档流」两个维度来选。',
    date: '2026-09-18',
    tags: ['面试', 'CSS'],
    readingTime: 7,
    content: `## 推荐优先级

1. **flex**：\`display:flex; align-items:center; justify-content:center;\` —— 首选
2. **grid**：\`place-items:center\` —— 一行搞定
3. **absolute + transform**：需要脱离文档流时用

## 容易踩的坑

\`transform\` 会创建新的包含块，父元素若用了 \`transform\`，
子元素的 \`position:fixed\` 会相对它定位，而不是视口。`
  },
  {
    id: 'vite-build-optimization',
    title: 'Vite 构建优化：从 3 秒到 1 秒',
    summary:
      '记录一次真实项目的构建提速过程：依赖预构建、按需引入组件库、手动分包与产物分析的具体配置。',
    date: '2026-09-25',
    tags: ['Vite', '性能优化', '工程化'],
    readingTime: 13,
    content: `## 四个有效手段

1. \`optimizeDeps.include\` 预构建体积大的依赖
2. 组件库改按需引入（\`unplugin-vue-components\`）
3. \`build.rollupOptions.output.manualChunks\` 拆出第三方包
4. \`rollup-plugin-visualizer\` 看产物构成再决定优化点

## 提醒

分包不是越细越好，过多的 chunk 会增加请求数，首屏反而更慢。`
  },
  {
    id: 'tailwind-dark-mode',
    title: 'Tailwind 实现暗黑模式：class 模式踩坑记录',
    summary:
      'darkMode 配置为 class 后与组件库样式打架、刷新闪白、以及表单控件不跟随变色的三个问题与解法。',
    date: '2026-10-15',
    tags: ['TailwindCSS', 'CSS'],
    readingTime: 8,
    content: `## 三个坑

1. **样式打架**：先引组件库样式，再引 Tailwind，让工具类优先级最高
2. **刷新闪白**：在 \`index.html\` 里用同步脚本提前打上 \`dark\` class
3. **控件不跟随**：同时设置 \`color-scheme\`，滚动条与表单才会变暗

\`\`\`css
:root { color-scheme: light dark; }
\`\`\``
  },
  {
    id: 'js-debounce-throttle',
    title: '手写防抖与节流：区别不止是时间间隔',
    summary:
      '防抖是等最后一次，节流是固定频率。给出带取消方法和 this 绑定的完整实现，以及各自典型场景。',
    date: '2026-09-12',
    tags: ['JavaScript', '面试'],
    readingTime: 6,
    content: `## 防抖

\`\`\`js
function debounce(fn, delay = 300) {
  let timer = null
  function debounced(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
  debounced.cancel = () => clearTimeout(timer)
  return debounced
}
\`\`\`

## 场景

搜索输入联想用防抖，滚动监听与按钮连点用节流。`
  },
  {
    id: 'browser-render-process',
    title: '浏览器渲染流程与重排重绘优化',
    summary:
      '从 DOM 树到像素的完整链路，哪些操作会触发重排，以及用 DevTools 定位性能瓶颈的方法。',
    date: '2026-10-09',
    tags: ['浏览器', '性能优化'],
    readingTime: 12,
    content: `## 渲染链路

DOM → CSSOM → Render Tree → Layout → Paint → Composite

## 触发重排的操作

修改几何属性（width、top、margin）、增删 DOM、读取 offsetTop 等布局信息。

## 优化

- 批量修改样式：先 \`display:none\` 或改 class
- 读写分离，避免布局抖动
- 动画优先用 \`transform\` 和 \`opacity\`，只走合成层`
  }
]
