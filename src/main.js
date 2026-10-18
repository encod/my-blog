import { createApp } from 'vue'

// Element Plus：先引入组件样式，再引入 Tailwind，保证工具类优先级最高
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import './styles/index.css'
// 正文排版样式需在 Tailwind 之后引入，避免被 preflight 重置
import './styles/markdown.css'

const app = createApp(App)

// 注册 Element Plus 与全部图标，业务组件内可直接使用 <el-xxx /> 与 <ElIconXxx />
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.mount('#app')
