<template>
  <div class="pt-2 text-center">
    <h1 class="text-app mb-2 flex items-center justify-center gap-1 text-5xl font-bold tracking-tight md:text-4xl">
      <span class="tabular-nums">{{ timeHour }}</span>
      <span class="text-app-tertiary mx-1 text-2xl font-medium tabular-nums md:text-xl">:</span>
      <span class="tabular-nums">{{ timeMinute }}</span>
      <span class="text-app-tertiary mx-1 text-2xl font-medium tabular-nums md:text-xl">:</span>
      <span class="text-app-tertiary mt-1 text-2xl font-medium tabular-nums md:text-xl">{{ timeSeconds }}</span>
      <span v-if="timeSuffix" class="text-app-tertiary mt-1 text-lg font-medium md:text-base">{{ timeSuffix }}</span>
    </h1>
    <p class="text-app-tertiary text-lg font-normal tracking-wide md:text-[1.05rem]">
      {{ date }}
    </p>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'

import { getLocale } from '@/i18n'

const timeHour = ref('')
const timeMinute = ref('')
const timeSeconds = ref('')
const timeSuffix = ref('')
const date = ref('')
let timer: ReturnType<typeof setInterval> | null = null

const updateTime = () => {
  const now = new Date()
  const currentLocale = getLocale() === 'zh' ? 'zh-CN' : 'en-US'

  const parts = new Intl.DateTimeFormat(currentLocale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(now)

  const getPart = (type: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === type)?.value || ''
  const hour = getPart('hour')
  const minute = getPart('minute')
  const second = getPart('second')
  const dayPeriod = getPart('dayPeriod')

  timeHour.value = hour
  timeMinute.value = minute
  timeSeconds.value = second
  timeSuffix.value = dayPeriod ? ` ${dayPeriod}` : ''

  date.value = now.toLocaleDateString(currentLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

onMounted(async () => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
