# Gitee Pages 已下线，迁移方案

## 事实：不是找不到入口，是服务没了

你翻遍 Gitee 设置页也找不到 Pages，原因不是没实名认证，而是 **Gitee Pages 已于 2025 年 5 月正式下线**。

证据：

| 来源 | 内容 |
|---|---|
| Gitee 官方 issue（oschina/git-osc #IC6I0L，2025-05-09） | 官方回复：「你好，该功能已下线。请关注我们以了解最新的动态」 |
| 稀土掘金 | 「码云（Gitee）已经下线 Pages 功能……官方并未发布任何回应，用户咨询客服才获得答复」 |
| 2026 年技术博客 | 「现在回头看已经停服：Pages 入口下架、直链失效、管理菜单移除」 |

本机实测（2026-10-18）也全部吻合：

| 测试 | 结果 |
|---|---|
| 仓库页顶部「服务」下拉 | 无 Gitee Pages 项 |
| `/ACaiYaTou/my-blog/pages`、`/settings/pages` | 404 |
| `ACaiYaTou.gitee.io/my-blog` | 404 |
| 其他第三方 `*.gitee.io` 站点（lin-feng1212、ol-resume 等） | 全部 404 |
| `gitee.io` 根域 | 连不上（000） |

> 注意：网上大量「Gitee Pages 并未下线」「Settings → Pages 启用」的文章是过时的或 AI 生成的，不可信。

**结论：这条路已经彻底走不通，代码留在 Gitee 当仓库没问题，但没法再用它托管网站。**

---

## 迁移方案对比

| 方案 | 国内访问 | 自动部署 | 上手难度 | 备注 |
|---|---|---|---|---|
| **GitHub Pages**（推荐） | 一般（网页需抢窗口，但部署不需要） | ✅ 推送即部署 | 低 | 本项目已配好 Actions，只差建仓库 |
| Netlify Drop | 一般 | ❌ 手动拖拽 | 最低 | 拖 `dist` 文件夹即上线，无需 Git |
| Cloudflare Pages | 一般 | ✅ | 中 | 需授权 GitHub 或直传 |
| 阿里云 OSS / 腾讯云 COS | 快 | 需自己写脚本 | 中 | 默认域名访问 html 会被强制下载，需备案域名 |

本机现状（已验证）：

- GitHub 账号：`encod`（2017 年注册，39 个公开仓库）
- SSH 认证：`ssh -T git@github.com` → `Hi encod!`（密钥正常，**推送不需要网页，也不需要 PAT**）
- `api.github.com` 可达（创建仓库、开 Pages 可走 API）
- `github.com` 网页间歇性可用（约 2~4 分钟一轮窗口，每次几分钟）

---

## 方案一：GitHub Pages（推荐）

### 第 1 步：创建仓库（唯一需要网页的一步）

网页打不开时，双击 `tools/open-github-watch.bat`，它会持续探测，一通就自动打开浏览器。

在 `https://github.com/new` 创建：
- Repository name：`my-blog`
- 选 **Public**
- **不要**勾 Add a README / .gitignore / license（本地已有）

### 第 2 步：推送（不需要网页）

```bash
cd F:/my-blog
git remote add origin git@github.com:encod/my-blog.git
git push -u origin main
```

SSH 密钥已验证可用，无需密码或令牌。

### 第 3 步：等 Actions 自动部署

推到 `main` 后会自动触发 `.github/workflows/deploy.yml`：

- 自动 `npm ci` + `npm run build -- --base /my-blog/`
- 自动启用 Pages（workflow 里已设 `enablement: true`，**不用去网页点开关**）
- 自动发布

约 1~2 分钟后访问：`https://encod.github.io/my-blog/`

在仓库的 **Actions** 标签页可以看构建进度。

### 以后的更新

```bash
cd F:/my-blog
git add -A && git commit -m "更新文章" && git push
```

推完自动部署，**不需要点任何按钮**——这点比 Gitee 强很多。

---

## 方案二：Netlify Drop（最快，5 分钟）

不想折腾 GitHub 网络的话：

1. 打开 `https://app.netlify.com/drop`
2. 注册/登录（支持邮箱）
3. 把 `F:/my-blog/dist` 整个文件夹**拖进页面**
4. 立刻得到一个 `https://xxx.netlify.app` 网址

注意：这样部署的产物 base 必须是 `/`（Netlify 部署在根路径），所以要重新构建一次：

```bash
cd F:/my-blog
npm run build
```

（不带 `--base`，默认就是 `/`）

缺点：以后更新要重新拖一次，没有自动部署。

---

## 常见问题

**Q：Gitee 上的仓库要删吗？**
不用。代码托管本身没问题，只是 Pages 托管不能用了。留着当备份或镜像也行。

**Q：GitHub 网页一直打不开，第 1 步怎么办？**
只有创建仓库这一步需要网页。用 `tools/open-github-watch.bat` 抢窗口，通常等几分钟就有一次。

**Q：能不能完全不用网页？**
可以，但需要 Personal Access Token（在网页生成），反而更麻烦。抢窗口建一次仓库更快。

**Q：部署后白屏怎么办？**
检查 `base` 是否为 `/my-blog/`（仓库名）。workflow 里已用 `GITHUB_REPOSITORY` 自动推导，正常不会错。
