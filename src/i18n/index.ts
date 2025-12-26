import { ref } from 'vue'

import en from './locales/en.json'
import zh from './locales/zh.json'

export type SupportedLocale = 'zh' | 'en'

type Messages = typeof zh

const messages: Record<SupportedLocale, Messages> = {
  zh,
  en,
}

const currentLocale = ref<SupportedLocale>('en')

// 获取默认语言
function getDefaultLocale(): SupportedLocale {
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('zh')) {
    return 'zh'
  }
  return 'en'
}

// 初始化语言
export async function initLocale() {
  try {
    const result = await chrome.storage.local.get('settings')
    const settings = result.settings as { language?: SupportedLocale } | undefined
    if (settings?.language === 'zh' || settings?.language === 'en') {
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
    const result = await chrome.storage.local.get('settings')
    const settings = result.settings || {}
    await chrome.storage.local.set({
      settings: { ...settings, language: locale },
    })
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
