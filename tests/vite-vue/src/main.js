import { createApp } from 'vue'
import App from './App.vue'
import GlobalComponent from './components/GlobalComponent.vue'

createApp(App).component('GlobalComponent', GlobalComponent).mount('#app')
