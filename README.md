# 前端笔记 · 个人技术博客

基于 **Vue 3 + Vite + Element Plus + TailwindCSS** 的静态个人技术博客，纯前端、无后端依赖，推送到 `main` 即自动构建发布。

- 线上地址：https://encod.github.io/my-blog/
- 仓库地址：https://github.com/encod/my-blog
- Gitee 镜像（仅代码）：https://gitee.com/ACaiYaTou/my-blog
  - `master` 分支：完整源码；`gh-pages` 分支：构建产物
  - 注意：Gitee Pages 静态托管已下线，`*.gitee.io` 域名不再可用，Gitee 仅作国内代码镜像

## 功能

- 首页文章卡片列表（分页）、文章详情、标签筛选、归档、关于我
- Markdown 渲染（markdown-it）+ 代码高亮（highlight.js，亮/暗两套 token）
- 文章详情页：顶部阅读进度条 + 右侧悬浮目录（与标题 slug 同源）
- 暗黑模式（跟随系统 / 手动切换，localStorage 持久化，首屏无闪烁）
- 吸顶导航（滚动变色、当前项下划线、搜索、移动端抽屉菜单）
- 响应式布局，适配桌面 / 平板 / 手机

## 本地运行

```bash
npm install      # 安装依赖
npm run dev      # 开发预览 http://localhost:5173
npm run build    # 生产构建，产物在 dist/
npm run preview  # 本地预览构建产物
```

## 部署（GitHub Pages）

已配置 GitHub Actions（`.github/workflows/deploy.yml`），推送到 `main` 即自动构建并发布：

```bash
git add .
git commit -m "feat: 更新内容"
git push origin main
```

首次部署需要在仓库网页端开通一次 Pages：
**Settings → Pages → Build and deployment → Source 选 `GitHub Actions`**。
开通后无需再操作，后续每次 push 全自动。

> 说明：开通 Pages 属于仓库管理员操作，Actions 内置的 `GITHUB_TOKEN` 没有该权限
> （会报 `Resource not accessible by integration`），因此无法在 workflow 里自动完成首次开通。

路由使用 hash 模式（`createWebHashHistory`），静态托管无需额外的 404 重写规则。

## 目录结构

```
src/
├── components/    # AppHeader、ArticleCard、Tag、Footer 等
├── composables/   # useTheme、useArticles、useIsMobile
├── views/         # Home、Article、Tags、Archive、About、NotFound
├── data/          # posts.js（文章数据）、profile.js（个人信息）
├── utils/         # markdown.js（渲染 + 目录提取）
├── styles/        # Tailwind 入口与组件层
└── router/        # 路由与导航配置
```

文章数据位于 `src/data/posts.js`，改数据源为 HTTP 请求的方式见 `docs/data-source-http.md`。
