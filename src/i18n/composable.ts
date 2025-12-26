import type { InjectionKey, Ref } from 'vue'
import { inject, provide } from 'vue'

import type { SupportedLocale } from './index'
import { getLocaleRef, setLocale, t } from './index'

export type I18nContext = {
  locale: Ref<SupportedLocale>
  t: (key: string) => string
  setLocale: (locale: SupportedLocale) => Promise<void>
}

export const I18nKey: InjectionKey<I18nContext> = Symbol('i18n')

export function provideI18n() {
  const locale = getLocaleRef()
  const translate = (key: string) => t(key)
  const changeLocale = async (newLocale: SupportedLocale) => {
    await setLocale(newLocale)
  }

  provide(I18nKey, {
    locale,
    t: translate,
    setLocale: changeLocale,
  })

  return {
    locale,
    t: translate,
    setLocale: changeLocale,
  }
}

export function useI18n() {
  // 提供默认值以避免 Vue 在未找到注入时输出警告
  const i18n = inject(I18nKey, null)
  if (!i18n) {
    // 如果没有提供（例如未安装插件），返回默认实现
    return {
      locale: getLocaleRef(),
      t: (key: string) => t(key),
      setLocale: async (locale: SupportedLocale) => {
        await setLocale(locale)
      },
    }
  }
  return {
    locale: i18n.locale,
    t: i18n.t,
    setLocale: i18n.setLocale,
  }
}
