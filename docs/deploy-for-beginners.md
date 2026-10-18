# 小白部署手册：把博客放到网上

不需要懂 Git 原理，跟着复制粘贴命令就行。每一步都写了「应该看到什么」和「出错怎么办」。

---

## 0. 先搞懂六个词（用大白话）

| 词 | 是什么 | 类比 |
|---|---|---|
| **dist** | 打包后生成的文件夹，里面是浏览器能直接跑的网页 | 做好的成品 |
| **仓库（repository）** | 平台上的一个项目空间 | 网盘里的一个文件夹 |
| **分支（branch）** | 同一个仓库里的不同版本线 | 文件夹里的不同副本 |
| **git push** | 把本地文件传上去 | 上传 |
| **Pages** | 平台提供的一个功能：把仓库里的网页文件变成能访问的网站 | 免费虚拟主机 |
| **base** | 网站放在网址的哪一层 | 门牌号 |

**整个部署就三件事**：本地把博客打包成 `dist` → 把 `dist` 传到平台仓库 → 在平台上开启 Pages，拿到网址。

---

## 1. 出发前检查

打开终端（Windows 用 Git Bash，或 VS Code 里的终端），逐条执行：

```bash
node -v      # 应显示 v22.x 之类，你的机器是 v22.22.2 ✅
npm -v       # 应显示 10.x，你的机器是 10.9.7 ✅
git --version # 应显示 git version 2.x，你的机器是 2.55.0 ✅
```

这三个都有，不用装。但检出两个待办：

- ⚠️ **Git 身份还没配置**（`user.name` / `user.email` 都是空的），必须先配，否则后面提交会报错
- ⚠️ **F:/my-blog 还不是 git 仓库**（没有 `.git` 目录），需要初始化

---

## 2. 一次性准备（只需做一次）

### 2.1 配置 Git 身份

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

邮箱要和注册平台的邮箱一致（不一致也能提交，只是贡献统计认不出来）。

### 2.2 决定走哪条路

| 平台 | 现状 | 建议 |
|---|---|---|
| **Gitee（码云）** | 国内能直接打开，实测正常 | ✅ **先走这条** |
| **GitHub** | 你当前的网络打不开 github.com（已诊断：域名被拦截） | 需要代理，或以后再说 |

下面先讲 Gitee 完整流程，GitHub 在 §5。

---

## 3. 路线 A：部署到 Gitee Pages

### 第 1 步：注册 Gitee 并完成实名认证

1. 打开 https://gitee.com 注册账号
2. **必须完成实名认证**（在 设置 → 实名认证），没认证无法开通 Pages

### 第 2 步：新建一个「公开」仓库

1. 右上角 ➕ → 新建仓库
2. 仓库名填 `my-blog`（**这个名字决定了网址和后面的 base，记住它**）
3. 选择 **公开**（私有仓库开不了免费 Pages）
4. 其他选项默认，点创建

### 第 3 步：生成私人令牌（用来代替密码）

Gitee 现在**不支持用登录密码 push**，要用「私人令牌」当密码。

1. 右上角头像 → 设置 → **私人令牌** → 生成新令牌
2. 勾选 `projects` 权限即可，提交后**复制那串令牌字符串**（只显示一次，先粘到记事本）

> 后面 `git push` 让你输密码时，把这串令牌当密码粘进去。用户名填你的 Gitee 用户名。

### 第 4 步：本地打包（注意 base）

在 `F:/my-blog` 目录执行：

```bash
npm run build -- --base /my-blog/
```

**`--base /my-blog/` 里的 my-blog 必须和你的仓库名一模一样**（大小写也要一致）。
它的作用是告诉网页「我的资源都放在 `/my-blog/` 这个子目录下」，不写的话上线后会白屏。

完成后应该看到 `dist` 文件夹，里面有 `index.html` 和 `assets/`。

### 第 5 步：把 dist 传上去

这里用一个**取巧但最省事**的做法：把 `dist` 当成一个独立的小仓库传，这样不会被项目里的 `.gitignore`（它忽略了 dist）干扰。

```bash
cd dist
git init
git checkout -b gh-pages
git add -A
git commit -m "部署博客"
git remote add origin https://gitee.com/<你的用户名>/my-blog.git
git push -f origin gh-pages
```

执行时会弹窗或提示输入用户名密码：
- 用户名 = 你的 Gitee 用户名
- 密码 = 第 3 步生成的**私人令牌**（不是登录密码）

看到 `Branch 'gh-pages' set up to track` 或 `Writing objects: 100%` 就是成功了。

> 以后每次重新部署都用 `-f`（强制覆盖），不用管历史记录。

### 第 6 步：开启 Pages

1. 打开你的仓库页面 → 顶部菜单 **服务** → **Gitee Pages**
2. 部署分支选 `gh-pages`
3. 部署目录**留空**（因为我们传的就是产物本身）
4. 点「启动」，等几十秒到几分钟

### 第 7 步：访问

地址是：`https://<你的用户名>.gitee.io/my-blog/`

打开看看：首页有没有内容、点文章能不能进、刷新页面会不会 404。

---

## 4. 以后怎么更新（写完新文章后）

Gitee Pages 免费版**不会自动更新**，每次都要：

```bash
# 1) 重新打包
npm run build -- --base /my-blog/

# 2) 重新上传
cd dist
git add -A
git commit -m "更新博客"
git push -f origin gh-pages
cd ..
```

# 3) **回到 Gitee → 服务 → Gitee Pages → 点「更新」**

**第 3 步不做，线上内容不会变** —— 这是 Gitee 和 GitHub 最大的区别，很多人卡在这。

---

## 5. 路线 B：部署到 GitHub Pages

### 前提

你现在的网络**打不开 github.com**（实测 TLS 握手被拦截，改 hosts 也没用）。要么先解决网络（开启代理客户端 + 打开系统代理），要么先走 Gitee。

验证能不能上：`curl -I https://github.com` 返回 `HTTP/2 200` 就说明通了。

### 步骤（网络通了以后）

1. 注册/登录 GitHub，新建仓库 `my-blog`（Public）
2. 同样不能用登录密码 push，要用 **Personal Access Token**：
   Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token，勾选 `repo`
3. 本地推源码（在 `F:/my-blog` 目录）：

```bash
git init
git add .
git commit -m "feat: 博客初始化"
git branch -M main
git remote add origin https://github.com/<用户名>/my-blog.git
git push -u origin main
```

4. 仓库 **Settings → Pages → Source → GitHub Actions**
5. 新建 `.github/workflows/deploy.yml`（完整内容见 `docs/deploy-pages.md`），它会**自动帮你打包并发布**，之后每次 push 都自动更新，不用手动点。

GitHub 的便利之处就在这：配好 Actions 后，`git push` 完就完事了。

---

## 6. 出错了看这里

| 现象 | 原因 | 怎么办 |
|---|---|---|
| `Please tell me who you are` | 没配 Git 身份 | 执行 §2.1 那两行 |
| `fatal: not a git repository` | 目录不对或没初始化 | 确认在 `dist` 目录里，且执行过 `git init` |
| push 时密码一直错 | 用了登录密码 | 用私人令牌 / Personal Access Token 当密码 |
| 网页白屏，控制台 `assets/xxx.js` 404 | base 写错 | 重新 `npm run build -- --base /仓库名/` 再传 |
| 页面能开但没样式 | 同上，CSS 404 | 同上 |
| Gitee 上传完了但网站还是旧的 | 没点「更新」 | Gitee Pages 页面点「更新」，等几分钟 |
| Gitee 说无法开通 Pages | 未实名 / 仓库私有 | 去实名认证，仓库改公开 |
| 头像不显示 | 资源路径问题 | 检查 `dist/avatar.jpg` 是否存在 |

---

## 7. 记住三句话

1. **仓库名决定 base**：仓库叫 `my-blog`，打包命令就是 `--base /my-blog/`，网址就是 `.../my-blog/`
2. **push 用的是令牌不是密码**
3. **Gitee 每次都要手动点「更新」**，GitHub 配了 Actions 就不用
