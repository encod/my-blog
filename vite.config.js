import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * Vite 工程配置
 * - @ 别名指向 src，便于模块按目录拆分引用
 * - 静态博客优先本地预览，端口固定 5173
 */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    // element-plus 全量引入体积较大，放宽告警阈值
    chunkSizeWarningLimit: 1500
  },
  base: '/my-blog/',
})
