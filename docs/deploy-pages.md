# 部署到 GitHub Pages / Gitee Pages 完整步骤

项目是 hash 路由（`createWebHashHistory`），部署到这两个平台**都不需要 SPA 回退配置**，这是最大的便利。核心只有三件事：设对 `base`、构建、把 `dist` 送上去。

---

## 0. 部署前必读：base 怎么定

| 仓库情况 | 访问地址 | `base` 值 |
|---|---|---|
| 用户主页仓库 `<用户名>.github.io` | `https://<用户名>.github.io/` | `/`（默认，不用改） |
| 普通项目仓库 `my-blog` | `https://<用户名>.github.io/my-blog/` | `/my-blog/` |
| Gitee 任意仓库 `my-blog` | `https://<用户名>.gitee.io/my-blog/` | `/my-blog/` |
| 绑定了自定义域名且在根路径 | `https://blog.example.com/` | `/` |

**base 设错的典型症状**：页面能打开但一片空白、控制台报 `/assets/index-xxx.js` 404。

两种设置方式，选一：

```js
// vite.config.js —— 写死，简单直接
export default defineConfig({
  base: '/my-blog/',   // 首尾斜杠都要有
  // …
})
```

```bash
# 或构建时用参数，方便同一份代码部署到不同路径
npm run build -- --base /my-blog/
```

> 仓库名就是子路径。大小写敏感，与 GitHub 仓库名保持一致。

---

## 1. GitHub Pages

### 1.1 方式 A：GitHub Actions 自动部署（推荐）

一次配好，之后每次 push 到主分支自动构建发布。

**第一步**，在项目里新建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]        # 若主分支是 master，改成 master
  workflow_dispatch:        # 允许在 Actions 页面手动触发

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      # 普通项目仓库：仓库名即子路径，自动推导 base
      - run: npm run build -- --base /${{ github.event.repository.name }}/
      # 若是 <用户名>.github.io 主页仓库，改用下面这行
      # - run: npm run build

      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**第二步**，可选：加一个空文件 `public/.nojekyll`。GitHub Pages 默认用 Jekyll 处理站点，会忽略下划线开头的目录和部分文件；虽然 Vite 产物一般不受影响，但加上是官方推荐做法，零成本。

```bash
# 在项目根目录执行
touch public/.nojekyll
```

**第三步**，推送并开启 Pages：

```bash
git init
git add .
git commit -m "feat: 初始化博客"
git branch -M main
git remote add origin https://github.com/<用户名>/my-blog.git
git push -u origin main
```

然后进仓库 **Settings → Pages → Build and deployment → Source**，选 **GitHub Actions**。

**第四步**，等 Actions 跑完（一般 1–2 分钟），Actions 页面会给出访问地址：`https://<用户名>.github.io/my-blog/`。

### 1.2 方式 B：手动推 gh-pages 分支

不想配 Actions 时用这个。把 `dist` 单独推到 `gh-pages` 分支：

```bash
# 1) 本地构建（注意 base）
npm run build -- --base /my-blog/

# 2) 进入产物目录，初始化一个独立仓库
cd dist
git init
git checkout -b gh-pages
git add -A
git commit -m "deploy: 构建产物"

# 3) 强制推送到远程 gh-pages 分支（每次都会覆盖历史）
git push -f https://github.com/<用户名>/my-blog.git gh-pages
cd ..
```

然后 **Settings → Pages → Source** 选「Deploy from a branch」→ 分支 `gh-pages`、目录 `/(root)` → Save。

> 提示：`dist` 在 `.gitignore` 里，但上面 `cd dist` 后单独 `git init`，不受外层 .gitignore 影响，无需 `git add -f`。

### 1.3 自定义域名（可选）

1. 域名解析加一条 CNAME 记录指向 `<用户名>.github.io`
2. `public/CNAME` 文件里写域名（如 `blog.example.com`），这样每次构建会自动带到 `dist`
3. Settings → Pages → Custom domain 填同样域名，勾选 Enforce HTTPS
4. **用了自定义域名且部署在根路径时，`base` 改回 `/`**

---

## 2. Gitee Pages

Gitee Pages 与 GitHub 的主要差别：**免费版不支持自动部署**，每次更新内容都要回到页面点一次「更新」；且要求实名认证 + 仓库公开。

### 2.1 前置条件

1. 完成 Gitee 账号**实名认证**（未认证无法开通 Pages）
2. 仓库必须是**公开**的（私有仓库的 Pages 需付费版）

### 2.2 部署步骤

**第一步**，创建公开仓库并推源码：

```bash
git remote add gitee https://gitee.com/<用户名>/my-blog.git
git push -u gitee main
```

**第二步**，本地构建，base 用仓库名：

```bash
npm run build -- --base /my-blog/
```

**第三步**，把产物提交进仓库（两种做法，选一）：

- 做法 1（推荐）：用 `.gitignore` 之外的独立分支只放产物

```bash
cd dist
git init && git checkout -b gh-pages
git add -A && git commit -m "deploy: 构建产物"
git push -f https://gitee.com/<用户名>/my-blog.git gh-pages
cd ..
```

- 做法 2：直接把 `dist` 提交到主分支（因为 `.gitignore` 忽略了 dist，需要强制添加）

```bash
git add -f dist
git commit -m "chore: 提交构建产物"
git push
```

**第四步**，开启 Pages：仓库页面 → **服务 → Gitee Pages** → 选择部署分支（`gh-pages` 或 `main`）：

- 若分支里整个目录就是产物 → 部署目录留空
- 若用做法 2（主分支含源码）→ 部署目录填 `dist`

点「启动」/「更新」，等待几十秒到几分钟，得到地址 `https://<用户名>.gitee.io/my-blog/`。

### 2.3 后续更新（重点）

Gitee Pages 免费版**不会自动重新构建**，流程是：

```bash
npm run build -- --base /my-blog/
cd dist && git add -A && git commit -m "deploy: 更新" && git push -f origin gh-pages && cd ..
# 然后回到 Gitee → 服务 → Gitee Pages → 点「更新」
```

不点「更新」的话，线上内容不会变。若想自动化，可以开通 **Gitee Go**（仓库 → 服务 → Gitee Go）配置流水线，构建后自动发布。

### 2.4 Gitee 注意事项

- 首页地址带子路径，所有资源引用都会走 `/my-blog/`，base 不能漏
- 未备案域名无法绑定自定义域名（按平台要求处理）
- 有内容审核，首次开通可能需要等待
- CDN 缓存刷新较慢，更新后看不到变化先强制刷新浏览器（Ctrl+F5）

---

## 3. 部署后验证清单

- [ ] 打开首页，无白屏，浏览器控制台无红色 404
- [ ] 依次点开：文章详情、标签页、归档、关于我
- [ ] **直接刷新** `#/tags`、`#/某文章id` 页面正常（hash 路由应当天然支持）
- [ ] 头像（`avatar.jpg`）正常显示
- [ ] 切换暗黑模式后刷新，主题保持
- [ ] 手机尺寸下汉堡菜单正常，无横向滚动
- [ ] 详情页 Markdown 代码高亮正常
- [ ] 查看页面源码里的资源路径前缀是否正确（应为 `/my-blog/assets/...`）

## 4. 故障速查

| 现象 | 原因 | 处理 |
|---|---|---|
| 白屏 + `assets/*.js` 404 | `base` 与实际路径不符 | 按 §0 修正 base 后重新构建部署 |
| 首页能开、样式全丢 | CSS 404，同上 | 同上 |
| GitHub Actions 报 `npm ci` 失败 | 缺 `package-lock.json` | 本地 `npm install` 生成后提交 |
| Actions 报权限错误 | Pages 未启用或权限不足 | Settings → Pages → Source 选 GitHub Actions；仓库 Settings → Actions → 允许读写 |
| Gitee 更新后线上没变 | 免费版需手动点「更新」 | 回 Pages 页面点更新，等待几分钟 |
| Gitee 提示无法开通 | 未实名 / 仓库私有 | 完成实名认证、改为公开仓库 |
| 部署后头像 404 | `public/` 资源路径 | 确认构建产物里有 `avatar.jpg`；子路径部署时检查引用前缀 |
