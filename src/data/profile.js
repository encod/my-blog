/**
 * 个人资料（示例内容，替换为自己的信息即可）
 * 抽成独立文件是为了让 About 页面只关心渲染，改内容时不用翻模板
 */

/** 基本信息 */
export const profile = {
  name: '阿彩',
  /**
   * 头像：放在 public 下，导航 Logo 与首页 Hero 共用。
   * 必须拼 BASE_URL 而不是写死 '/avatar.jpg'：
   * 部署在 GitHub Pages 子路径（/my-blog/）时，写死根路径会 404。
   */
  avatar: `${import.meta.env.BASE_URL}avatar.jpg`,
  /** 头像兜底文字，图片加载失败时使用 */
  avatarText: 'FE',
  title: '前端开发工程师 · Vue / 工程化',
  /** 简介段落，每段渲染成一行 */
  bio: [
    '一名把大部分业余时间花在写代码和写笔记上的前端开发者，关注 Vue 生态、构建工具与研发效率。',
    '这个站点用来沉淀日常学习中的结论与踩坑记录：既有 Vue、Git 这类工具性知识，也有面试复盘和 AI 辅助编码的实践体会。'
  ]
}

/** 技术栈：按类别分组 */
export const skillGroups = [
  {
    category: '基础',
    items: ['HTML5 / CSS3', 'JavaScript (ES6+)', 'TypeScript']
  },
  {
    category: '框架',
    items: ['Vue3', 'Element Plus', 'TailwindCSS', 'Vue Router']
  },
  {
    category: '工程化',
    items: ['Vite', 'Git', 'ESLint / Prettier', 'Markdown']
  },
  {
    category: '拓展',
    items: ['Node.js', 'AI 辅助编程', '性能优化']
  }
]

/** 学习经历：时间线按倒序排列 */
export const timeline = [
  {
    date: '2026',
    title: '系统梳理前端知识体系',
    desc: '深入 Vue3 响应式与编译优化，把日常积累的笔记整理成站点，倒逼自己把问题想清楚。'
  },
  {
    date: '2025',
    title: '把 AI 引入日常开发',
    desc: '在需求拆解、代码评审、重构三个环节使用大模型，逐步形成适合自己的协作流程。'
  },
  {
    date: '2024',
    title: '转向 Vue 技术栈',
    desc: '从 jQuery 迁移到 Vue，独立完成第一个中后台项目，开始接触构建工具与组件库。'
  },
  {
    date: '2023',
    title: '入门前端',
    desc: '从 HTML / CSS / JavaScript 三件套起步，第一次把静态页面部署到线上。'
  }
]

/** 联系方式：href 以 mailto: 开头时自动使用邮件图标 */
export const contacts = [
  { label: 'GitHub', href: 'https://github.com' },
  { label: '掘金', href: 'https://juejin.cn' },
  { label: '邮箱', href: 'mailto:your@example.com' }
]
