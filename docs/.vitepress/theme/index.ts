import type { App } from 'vue'
import DefaultTheme from 'vitepress/theme'
import TalentApp from './components/TalentApp.vue'
import './components/index.css'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: { app: App }) {
    app.component('TalentApp', TalentApp)
  }
}
