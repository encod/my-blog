# 本地运行、打包与静态部署

## 1. 环境要求

| 项 | 版本 | 说明 |
|---|---|---|
| Node.js | ≥ 18（建议 20 LTS / 22） | Vite 6 要求 Node 18+ |
| npm | ≥ 9 | 随 Node 附带 |

```bash
node -v
npm -v
```

## 2. 常用命令

```bash
# 安装依赖（首次或 package.json 变更后）
npm install

# 本地开发：http://localhost:5173（vite.config.js 中 server.port 固定 5173，open 自动开浏览器）
npm run dev

# 生产构建：输出到 dist/，默认自动清空旧产物
npm run build

# 本地预览构建产物：http://localhost:4173（验证 dist 是否正常，不是用来开发的）
npm run preview
```

### 2.1 常用参数

```bash
npm run dev -- --host              # 局域网/手机真机访问，终端会打印 Network 地址
npm run dev -- --port 8080         # 换端口（端口被占用时 Vite 会自动 +1）
npm run build -- --base /blog/     # 部署到子目录时用，见 §4.2
npm run build -- --outDir dist     # 自定义输出目录
npm run preview -- --port 8080     # 指定预览端口
```

> `--` 用于把参数透传给 Vite。Windows 下同样写法有效。

### 2.2 清理

`vite build` 默认会清空 `dist/`。需要手动清缓存/重装时：

```bash
# 删除构建产物（Windows PowerShell）
Remove-Item -Recurse -Force dist

# 彻底重装依赖
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

## 3. 构建产物说明

```
dist/
├── index.html                 # 入口，必须部署
├── avatar.jpg                 # public/ 下的文件原样拷贝（头像等）
└── assets/
    ├── index-DDfIVAr1.js      # 主包（含 Vue + Element Plus + 路由）
    ├── Article-DJoN8xEy.js    # 详情页分包（markdown-it + highlight.js）
    ├── Home-*.js / Tags-*.js / Archive-*.js / About-*.js / NotFound-*.js
    └── index-*.css            # 全部样式（Tailwind + Element Plus）
```

**带 hash 的文件名可以永久强缓存**（内容变了文件名就变）；`index.html` 绝对不能缓存。

当前产物体积（参考）：主包 1.23 MB（gzip 396 KB）、详情页分包 277 KB（gzip 104 KB）、CSS 403 KB（gzip 55 KB）。主要原因是 Element Plus 全量引入 + 组件库样式全量打包。**务必开启服务端 gzip/brotli**，否则首屏会明显偏慢。

## 4. 部署注意事项（按踩坑概率排序）

### 4.1 路由模式：当前是 hash，静态服务器零配置

`src/router/index.js` 用的是 `createWebHashHistory()`，URL 形如 `https://example.com/#/tags`。hash 部分不会发给服务器，所以：

- 任意静态服务器（Nginx、对象存储、GitHub Pages）**都不需要配置 SPA fallback**
- 直接刷新 `#/vue3-reactivity-principle` 也不会 404

如果以后改成 `createWebHistory()`（去掉 `#`），就必须配置「所有路径回退到 index.html」，否则刷新子页面就是 404：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### 4.2 部署到子目录必须设 base

默认 `base: '/'` 假设站点在域名根路径。若部署到 `https://user.github.io/my-blog/` 或 `https://example.com/blog/`，不设 base 会导致 JS/CSS 请求打到 `/assets/...` 而 404，页面白屏。

两种改法，选一：

```js
// vite.config.js
export default defineConfig({
  base: '/my-blog/',   // 注意首尾都要有斜杠
})
```

```bash
npm run build -- --base /my-blog/
```

目标是根路径时保持默认 `'/'` 即可。

### 4.3 缓存策略

```nginx
# index.html：每次都校验，避免发版后用户还拿着旧入口
location = /index.html {
  add_header Cache-Control "no-cache, must-revalidate";
}

# 带 hash 的静态资源：长期强缓存
location /assets/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

对象存储（COS/OSS）同理：给 `assets/` 目录设长缓存，给 `index.html` 设 `no-cache` 并在发版后刷新 CDN。

### 4.4 开启压缩

```nginx
gzip on;
gzip_types text/css application/javascript application/json image/svg+xml;
gzip_min_length 1024;
# 有条件可再加 brotli（brotli on; brotli_types ...）
```

CDN/对象存储一般在控制台开关「Gzip/Brotli 自动压缩」，优先用平台能力。

### 4.5 环境变量是构建时注入的

`VITE_*` 变量（如 `VITE_API_BASE`）在 `npm run build` 时被**硬编码进产物**，改动后必须重新构建，不能只改服务器上的配置。换环境要重新打包，或用 `.env.production` / `.env.staging` 区分：

```bash
npm run build -- --mode staging
```

### 4.6 public/ 与 src/assets/ 的区别

- `public/` 下的文件**原样拷贝、不参与打包、不能压缩处理**，引用时用绝对路径：`/avatar.jpg`。项目里的头像就是这种。
- 子目录部署时，public 里的引用也要跟着 base 走（用 `import.meta.env.BASE_URL + 'avatar.jpg'` 拼，或保持根路径部署）。

### 4.7 HTTPS 与混合内容

站点上了 HTTPS 后，页面里引用的外链（友链、图标）必须是 HTTPS，否则浏览器会拦截。页脚与关于页的外链检查一下。

## 5. 三种典型部署方式

### 5.1 Nginx

```bash
npm run build
# 把 dist/ 整个目录内容传到服务器
scp -r dist/* user@server:/var/www/blog/
```

```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/blog;
  index index.html;

  gzip on;
  gzip_types text/css application/javascript application/json;

  location = /index.html { add_header Cache-Control "no-cache"; }
  location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; }

  # hash 路由不需要 try_files；若改用 history 路由则必须加
  # location / { try_files $uri $uri/ /index.html; }
}
```

### 5.2 GitHub Pages

1. `vite.config.js` 设 `base: '/仓库名/'`（若使用自定义域名且部署在根路径则用 `'/'`）
2. `npm run build`
3. 把 `dist/` 内容推到 `gh-pages` 分支，或用 Actions 自动部署

因为用的是 hash 路由，**不需要** 404.html 回退技巧（那是 history 路由才需要的）。

### 5.3 对象存储静态网站（腾讯云 COS / 阿里云 OSS）

1. 开启「静态网站托管」，默认首页填 `index.html`
2. 上传 `dist/` 全部内容（保持目录结构）
3. 控制台设置：`assets/` 目录长缓存，`index.html` 不缓存
4. 开启 CDN 并打开 Gzip/Brotli
5. 每次发版后刷新 CDN 中 `index.html` 的缓存

## 6. 部署前自测清单

```bash
npm run build && npm run preview   # 用 4173 端口模拟线上
```

- [ ] 首页、文章详情、标签页、归档、关于我五个页面都能打开
- [ ] 直接刷新 `#/tags`、`#/某个文章id` 不 404
- [ ] 浏览器控制台无资源 404（尤其 `assets/` 与 `/avatar.jpg`）
- [ ] 切换暗黑模式 → 刷新 → 主题保持（读 localStorage `blog-theme`）
- [ ] 手机尺寸（375px）下导航折叠为汉堡菜单，无横向滚动
- [ ] 打开详情页，代码高亮与右侧目录正常
- [ ] 若已接入 HTTP 数据源：接口地址指向的是生产域名而非 localhost

## 7. 故障速查

| 现象 | 原因 | 处理 |
|---|---|---|
| 白屏，控制台 `/assets/xxx.js` 404 | base 与实际部署路径不符 | 按 §4.2 设 base 重新构建 |
| 页面能开，刷新子页面 404 | 用了 history 路由却没配回退 | 换回 hash 路由，或配 `try_files` |
| 首页能开但样式全丢 | CSS 404，同上 | 检查 base 与服务器目录层级 |
| 头像不显示 | public 资源路径问题 | 确认 `dist/avatar.jpg` 存在 |
| 发版后仍是旧页面 | index.html 被缓存 | 按 §4.3 设 no-cache 并刷新 CDN |
| 首屏很慢 | 未开压缩 | 开启 gzip/brotli，见 §4.4 |
