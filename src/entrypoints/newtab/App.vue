<template>
  <div class="relative flex min-h-screen w-full flex-col items-center px-6 py-12 md:px-5 md:py-8">
    <Setting />
    <DateTime />
    <div class="mb-8 w-full md:mb-6">
      <SearchBox />
    </div>
    <HistoryList />
  </div>
</template>
<script lang="ts" setup>
import 'tailwindcss'

import { onMounted, ref } from 'vue'

import DateTime from '@/components/DateTime.vue'
import HistoryList from '@/components/HistoryList.vue'
import SearchBox from '@/components/SearchBox.vue'
import Setting from '@/components/Setting.vue'
import { getSettings } from '@/utils/storage'

onMounted(async () => {
  // 应用主题设置
  const settings = await getSettings()
  applyTheme(settings.theme)
})

const applyTheme = (theme: string) => {
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.remove('dark')
    root.classList.add('light')
  } else if (theme === 'dark') {
    root.classList.remove('light')
    root.classList.add('dark')
  } else {
    root.classList.remove('light', 'dark')
  }
}
</script>
