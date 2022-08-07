import Theme from 'vitepress/theme'
import DynamicLayout from '../components/DynamicLayout.vue'
import './main.css'

export default {
  ...Theme,
  Layout: DynamicLayout
}
