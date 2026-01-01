<template>
  <div class="pt-2 text-center">
    <h1 class="text-app mb-2 flex items-center justify-center gap-1 text-5xl font-bold tracking-tight md:text-4xl">
      <span class="tabular-nums">{{ timeHour }}</span>
      <span class="text-app-tertiary mx-1 text-2xl font-medium tabular-nums md:text-xl">:</span>
      <span class="tabular-nums">{{ timeMinute }}</span>
      <span class="text-app-tertiary mx-1 text-2xl font-medium tabular-nums md:text-xl">:</span>
      <span class="text-app-tertiary tabular-nums">{{ timeSeconds }}</span>
      <span v-if="timeSuffix" class="text-app-tertiary mt-1 text-lg font-medium md:text-base">{{ timeSuffix }}</span>
    </h1>
    <p class="text-app-tertiary text-lg font-normal tracking-wide md:text-[1.05rem]">
      {{ date }}
    </p>
    <p v-if="showLunar && lunarDate" class="text-app-tertiary mt-1 text-sm font-normal tracking-wide">
      {{ lunarDate }}
    </p>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'

import type { SupportedLocale } from '@/i18n'
import { getLocaleRef } from '@/i18n'
import { formatLunarDate, solarToLunar } from '@/utils/lunar'
import { getSettings } from '@/utils/storage'

const timeHour = ref('')
const timeMinute = ref('')
const timeSeconds = ref('')
const timeSuffix = ref('')
const date = ref('')
const lunarDate = ref('')
const showLunar = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const UPDATE_INTERVAL_MS = 1000

/**
 * 将 SupportedLocale 格式转换为浏览器 locale 格式
 */
const toBrowserLocale = (locale: SupportedLocale): string => {
  const localeMap: Record<SupportedLocale, string> = {
    zh_CN: 'zh-CN',
    zh_TW: 'zh-TW',
    en: 'en-US',
    ja: 'ja-JP',
    ko: 'ko-KR',
    fr: 'fr-FR',
    de: 'de-DE',
    es: 'es-ES',
    ru: 'ru-RU',
  }
  return localeMap[locale] || 'en-US'
}

/**
 * 从日期格式化部分中获取指定类型的值
 */
const getDateTimePart = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string => {
  return parts.find(p => p.type === type)?.value || ''
}

const updateTime = () => {
  const now = new Date()
  const currentLocale = getLocaleRef().value
  const browserLocale = toBrowserLocale(currentLocale)

  const parts = new Intl.DateTimeFormat(browserLocale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(now)

  timeHour.value = getDateTimePart(parts, 'hour')
  timeMinute.value = getDateTimePart(parts, 'minute')
  timeSeconds.value = getDateTimePart(parts, 'second')

  const dayPeriod = getDateTimePart(parts, 'dayPeriod')
  timeSuffix.value = dayPeriod ? ` ${dayPeriod}` : ''

  // 使用 formatToParts 手动组合日期，确保格式一致
  const dateParts = new Intl.DateTimeFormat(browserLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).formatToParts(now)

  const year = getDateTimePart(dateParts, 'year')
  const month = getDateTimePart(dateParts, 'month')
  const day = getDateTimePart(dateParts, 'day')
  const weekday = getDateTimePart(dateParts, 'weekday')

  // 对于中文（简体或繁体），统一格式为：yyyy 年 M 月 d 日 EEEE（日期和星期之间有空格）
  // 对于其他语言，使用浏览器默认格式
  if (currentLocale === 'zh_CN' || currentLocale === 'zh_TW') {
    date.value = `${year}年${month}月${day}日 ${weekday}`
  } else {
    date.value = now.toLocaleDateString(browserLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  // 更新农历日期
  if (showLunar.value && (currentLocale === 'zh_CN' || currentLocale === 'zh_TW')) {
    const lunar = solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate())
    lunarDate.value = formatLunarDate(lunar, currentLocale)
  } else {
    lunarDate.value = ''
  }
}

// 监听语言变化，立即更新时间
watch(getLocaleRef(), () => {
  updateTime()
})

// 监听设置变化，更新农历显示状态
const updateLunarSettings = async () => {
  try {
    const settings = await getSettings()
    const currentLocale = getLocaleRef().value
    showLunar.value = settings.showLunarCalendar && (currentLocale === 'zh_CN' || currentLocale === 'zh_TW')
    updateTime()
  } catch {
    showLunar.value = false
  }
}

// 监听存储变化
const onStorageChanged = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
  if (areaName !== 'local') return
  const change = changes.settings
  if (!change?.newValue) return
  const settings = change.newValue as { showLunarCalendar?: boolean }
  const currentLocale = getLocaleRef().value
  showLunar.value = (settings.showLunarCalendar ?? false) && (currentLocale === 'zh_CN' || currentLocale === 'zh_TW')
  updateTime()
}

onMounted(async () => {
  await updateLunarSettings()
  updateTime()
  timer = setInterval(updateTime, UPDATE_INTERVAL_MS)
  chrome.storage.onChanged.addListener(onStorageChanged)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  chrome.storage.onChanged.removeListener(onStorageChanged)
})
</script>
