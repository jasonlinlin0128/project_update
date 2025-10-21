import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入全局样式
import './assets/styles/main.css'

// 创建应用实例
const app = createApp(App)

// 使用插件
app.use(createPinia())
app.use(router)

// 挂载应用
app.mount('#app')

console.log('✅ Vue 应用已启动')
console.log('🔧 环境:', import.meta.env.MODE)
console.log('🔥 Firebase 配置已加载')
