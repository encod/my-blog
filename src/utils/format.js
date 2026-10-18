/** 补零：1 → '01' */
function pad(value) {
  return String(value).padStart(2, '0')
}

/** 转成 Date，失败返回 null */
function toDate(input) {
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? null : date
}

/** 日期格式化：2026-10-12 */
export function formatDate(input) {
  const date = toDate(input)
  if (!date) return String(input ?? '')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 日期格式化（中文）：2026年10月12日 */
export function formatDateCN(input) {
  const date = toDate(input)
  if (!date) return String(input ?? '')
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

/** 阅读时长文案：8 → 约 8 分钟 */
export function formatReadingTime(minutes) {
  if (!minutes) return ''
  return `约 ${minutes} 分钟`
}
