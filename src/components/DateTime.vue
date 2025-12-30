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
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'

import type { SupportedLocale } from '@/i18n'
import { getLocaleRef } from '@/i18n'

const timeHour = ref('')
const timeMinute = ref('')
const timeSeconds = ref('')
const timeSuffix = ref('')
const date = ref('')
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

  date.value = now.toLocaleDateString(browserLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

// 监听语言变化，立即更新时间
watch(getLocaleRef(), () => {
  updateTime()
})

onMounted(async () => {
  updateTime()
  timer = setInterval(updateTime, UPDATE_INTERVAL_MS)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
