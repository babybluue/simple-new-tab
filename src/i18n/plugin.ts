import type { App } from 'vue'

import { getLocaleRef, setLocale, t } from './index'

export default {
  install(app: App) {
    const localeRef = getLocaleRef()

    // 提供全局属性 $t（响应式）
    app.config.globalProperties.$t = (key: string) => {
      // 访问 localeRef.value 以建立响应式依赖
      localeRef.value
      return t(key)
    }

    // 提供全局属性 $locale
    app.config.globalProperties.$locale = {
      get value() {
        return localeRef.value
      },
      set: setLocale,
    }
  },
}
