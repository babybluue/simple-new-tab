import '@/assets/style.css'

import { createApp } from 'vue'

import { initLocale } from '@/i18n'
import i18nPlugin from '@/i18n/plugin'
import { applyCustomCss } from '@/utils/customCss'
import { getSettings } from '@/utils/storage'
import { applyBackground, applyPrimaryColor, applyTheme } from '@/utils/theme'

import App from './App.vue'
;(async () => {
  // 初始化i18n
  await initLocale()

  const settings = await getSettings()
  applyTheme(settings.theme)
  await applyBackground(settings)
  applyPrimaryColor(settings.primaryColor)
  applyCustomCss(settings)

  const app = createApp(App, { initialSettings: settings })
  app.use(i18nPlugin)
  app.mount('#app')
})()
