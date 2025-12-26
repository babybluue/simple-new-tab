<template>
  <div class="pt-2 text-center">
    <h1 class="mb-2 text-5xl">
      {{ time }}
    </h1>
    <p class="text-2xl font-light tracking-wide md:text-[1.2rem]" style="color: var(--app-text-color-secondary)">
      {{ date }}
    </p>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import { getLocale } from '@/i18n'

const time = ref('')
const date = ref('')

const updateTime = () => {
  const now = new Date()
  const currentLocale = getLocale() === 'zh' ? 'zh-CN' : 'en-US'
  time.value = now.toLocaleTimeString(currentLocale, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  date.value = now.toLocaleDateString(currentLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

onMounted(async () => {
  updateTime()
  setInterval(updateTime, 1000)
})
</script>
