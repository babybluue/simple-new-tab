import type { App } from 'vue'

import { I18nKey } from './composable'
import { getLocaleRef, setLocale, t } from './index'

export default {
  install(app: App) {
    const localeRef = getLocaleRef()

    const translate = (key: string) => {
      // 访问 localeRef.value 以建立响应式依赖
      localeRef.value
      return t(key)
    }

    // 为组合式 API 提供注入上下文（避免组件内 inject 找不到的 warn）
    app.provide(I18nKey, {
      locale: localeRef,
      t: translate,
      setLocale,
    })

    // 提供全局属性 $t（响应式）
    app.config.globalProperties.$t = translate

    // 提供全局属性 $locale
    app.config.globalProperties.$locale = {
      get value() {
        return localeRef.value
      },
      set: setLocale,
    }
  },
}
