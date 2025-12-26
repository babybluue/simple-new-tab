import type { SupportedLocale } from './index'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (key: string) => string
    $locale: {
      value: SupportedLocale
      set: (locale: SupportedLocale) => Promise<void>
    }
  }
}

