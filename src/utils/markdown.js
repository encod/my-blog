import MarkdownIt from 'markdown-it'
// 只载入常用语言包，比 highlight.js 全量引入小很多
import hljs from 'highlight.js/lib/common'

/**
 * Markdown 渲染器
 * 做了四件事：
 * 1. 代码块交给 highlight.js 高亮
 * 2. 标题生成锚点 id，支持 #hash 跳转
 * 3. 表格外层套滚动容器，移动端长表格可横向滑动
 * 4. 外链自动新窗口打开并加 noopener
 */

/** 标题文本 → 锚点 id（保留中英文与数字，其余转短横线） */
function slugify(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const md = new MarkdownIt({
  html: true, // 允许正文里写 HTML
  linkify: true, // 自动识别链接
  breaks: false, // 单换行不转 <br>，符合 Markdown 习惯
  /**
   * 代码高亮
   * 返回值需包含完整的 <pre> 结构，markdown-it 会原样输出
   */
  highlight(code, lang) {
    const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
    let highlighted = ''
    try {
      highlighted = hljs.highlight(code, { language, ignoreIllegals: true }).value
    } catch (e) {
      highlighted = md.utils.escapeHtml(code)
    }
    return `<pre class="hljs-pre"><code class="hljs language-${language}">${highlighted}</code></pre>`
  }
})

/** 标题加锚点 id */
md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const content = tokens[idx + 1]?.content || ''
  tokens[idx].attrSet('id', slugify(content))
  return self.renderToken(tokens, idx, options)
}

/** 表格包一层可横向滚动的容器 */
md.renderer.rules.table_open = () => '<div class="table-wrapper"><table>'
md.renderer.rules.table_close = () => '</table></div>'

/** 外链新窗口打开 */
const defaultLinkOpen = md.renderer.rules.link_open
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const hrefIndex = tokens[idx].attrIndex('href')
  const href = hrefIndex >= 0 ? tokens[idx].attrs[hrefIndex][1] : ''
  if (/^https?:\/\//i.test(href)) {
    tokens[idx].attrSet('target', '_blank')
    tokens[idx].attrSet('rel', 'noopener noreferrer')
  }
  const fallback = defaultLinkOpen
    ? defaultLinkOpen(tokens, idx, options, env, self)
    : self.renderToken(tokens, idx, options)
  return fallback
}

/** 渲染 Markdown 为 HTML 字符串 */
export function renderMarkdown(content) {
  if (!content) return ''
  return md.render(content)
}

/**
 * 提取标题，供文章右侧目录使用
 * 复用同一套 slugify，保证跳转锚点与正文里的 id 完全一致
 * @returns {Array<{level:number, text:string, id:string}>}
 */
export function getHeadings(content) {
  if (!content) return []

  const tokens = md.parse(content, {})
  const headings = []

  tokens.forEach((token, index) => {
    if (token.type !== 'heading_open') return
    if (token.tag !== 'h2' && token.tag !== 'h3') return

    const text = tokens[index + 1]?.content || ''
    headings.push({
      level: Number(token.tag.slice(1)),
      text,
      id: slugify(text)
    })
  })

  return headings
}
