import { ref } from 'vue'

import { getSettings, saveSettings } from '@/utils/storage'

import de from './locales/de.json'
import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import ja from './locales/ja.json'
import ko from './locales/ko.json'
import ru from './locales/ru.json'
import zh_CN from './locales/zh_CN.json'
import zh_TW from './locales/zh_TW.json'

export type SupportedLocale = 'zh_CN' | 'zh_TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru'

type Messages = typeof zh_CN

const messages: Record<SupportedLocale, Messages> = {
  zh_CN,
  zh_TW,
  en,
  ja,
  ko,
  fr,
  de,
  es,
  ru,
}

const currentLocale = ref<SupportedLocale>('en')

// 获取默认语言
function getDefaultLocale(): SupportedLocale {
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('zh')) {
    // zh-TW, zh-HK, zh-MO 等使用繁体中文，其他使用简体中文
    if (browserLang.includes('tw') || browserLang.includes('hk') || browserLang.includes('mo')) {
      return 'zh_TW'
    }
    return 'zh_CN'
  }
  if (browserLang.startsWith('ja')) {
    return 'ja'
  }
  if (browserLang.startsWith('ko')) {
    return 'ko'
  }
  if (browserLang.startsWith('fr')) {
    return 'fr'
  }
  if (browserLang.startsWith('de')) {
    return 'de'
  }
  if (browserLang.startsWith('es')) {
    return 'es'
  }
  if (browserLang.startsWith('ru')) {
    return 'ru'
  }
  return 'en'
}

// 初始化语言
export async function initLocale() {
  try {
    const result = await chrome.storage.local.get('settings')
    const settings = result.settings as { language?: SupportedLocale } | undefined
    const supportedLocales: SupportedLocale[] = ['zh_CN', 'zh_TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru']
    if (settings?.language && supportedLocales.includes(settings.language)) {
      currentLocale.value = settings.language
      return
    }
  } catch {
    // 忽略错误
  }
  currentLocale.value = getDefaultLocale()
}

// 设置语言
export async function setLocale(locale: SupportedLocale) {
  currentLocale.value = locale
  try {
    // 使用 getSettings() 获取完整的设置，避免只保存 language 导致其他字段丢失
    const settings = await getSettings()
    await saveSettings({ ...settings, language: locale })
  } catch {
    // 忽略错误
  }
}

// 获取当前语言（响应式）
export function getLocale(): SupportedLocale {
  return currentLocale.value
}

// 获取当前语言 ref（用于响应式）
export function getLocaleRef() {
  return currentLocale
}

// 翻译函数
export function t(key: string): string {
  const keys = key.split('.')
  let value: any = messages[currentLocale.value]
  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) {
      // 如果当前语言找不到，尝试 fallback
      value = messages.en
      for (const k2 of keys) {
        value = value?.[k2]
      }
      break
    }
  }
  return typeof value === 'string' ? value : key
}
