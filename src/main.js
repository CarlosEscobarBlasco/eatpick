import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/scss/custom.scss'

const app = createApp(App)
app.use(router)
app.mount('#app')
