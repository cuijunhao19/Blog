import { createApp } from 'vue'
import App from './App.vue'
import router from './routes'
// 导入全局样式
import './assets/css/global.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
