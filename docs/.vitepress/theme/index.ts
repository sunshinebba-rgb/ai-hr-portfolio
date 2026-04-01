import type { App } from 'vue'
import DefaultTheme from 'vitepress/theme'
import TalentApp from './components/TalentReviewApp.vue'
import Layout from './Layout.vue'
import './components/index.css'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: { app: App }) {
    app.component('TalentApp', TalentApp)
  }
}
