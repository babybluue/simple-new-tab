import type { InjectionKey } from 'vue'
import { computed, inject, provide } from 'vue'

import type { SupportedLocale } from './index'
import { getLocale, setLocale, t } from './index'

const I18nKey: InjectionKey<{
  locale: SupportedLocale
  t: (key: string) => string
  setLocale: (locale: SupportedLocale) => Promise<void>
}> = Symbol('i18n')

export function provideI18n() {
  const locale = computed(() => getLocale())
  const translate = (key: string) => t(key)
  const changeLocale = async (newLocale: SupportedLocale) => {
    await setLocale(newLocale)
  }

  provide(I18nKey, {
    locale: locale.value,
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
  const i18n = inject(I18nKey)
  if (!i18n) {
    // 如果没有提供，返回默认实现
    return {
      locale: computed(() => getLocale()),
      t: (key: string) => t(key),
      setLocale: async (locale: SupportedLocale) => {
        await setLocale(locale)
      },
    }
  }
  return {
    locale: computed(() => i18n.locale),
    t: i18n.t,
    setLocale: i18n.setLocale,
  }
}
