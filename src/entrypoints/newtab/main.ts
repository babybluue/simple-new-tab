import '@/assets/style.css'

import { createApp } from 'vue'

import App from './App.vue'
import { applyBackground, applyTheme } from '@/utils/theme'
import { getSettings } from '@/utils/storage'

;(async () => {
  const settings = await getSettings()
  applyTheme(settings.theme)
  await applyBackground(settings)

  createApp(App, { initialSettings: settings }).mount('#app')
})()
