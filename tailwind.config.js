/** @type {import('tailwindcss').Config} */
export default {
  // 暗黑模式跟随 <html class="dark">，与 Element Plus 的 dark 机制保持一致
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        // 品牌色：蓝色系，深浅两套由 dark: 变体切换
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'PingFang SC',
          'Microsoft YaHei',
          'Helvetica Neue',
          'sans-serif'
        ],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Menlo', 'monospace']
      },
      maxWidth: {
        // 正文阅读宽度，过宽会影响阅读节奏
        content: '820px'
      },
      boxShadow: {
        // 更柔和的卡片阴影：近处极浅、远处大扩散
        card: '0 1px 2px rgba(15, 23, 42, 0.03), 0 10px 30px -12px rgba(15, 23, 42, 0.12)',
        lift: '0 2px 4px rgba(15, 23, 42, 0.04), 0 18px 40px -16px rgba(15, 23, 42, 0.18)'
      }
    }
  },
  plugins: []
}
