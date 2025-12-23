<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import HistoryList from '@/components/HistoryList.vue'
import SearchBox from '@/components/SearchBox.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import { getSettings } from '@/utils/storage'

const time = ref('')
const date = ref('')
const showSettings = ref(false)

const updateTime = () => {
  const now = new Date()
  time.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  date.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

onMounted(async () => {
  updateTime()
  setInterval(updateTime, 1000)

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

const openSettings = () => {
  showSettings.value = true
}

const closeSettings = () => {
  showSettings.value = false
}
</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col items-center px-6 py-12 md:px-5 md:py-8">
    <!-- 设置按钮 -->
    <button
      class="absolute top-6 right-6 flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white/90 shadow-lg backdrop-blur-lg transition-all duration-300 hover:scale-110 hover:rotate-90 hover:bg-white/25 hover:text-white hover:shadow-xl md:top-5 md:right-5 md:h-11 md:w-11 dark:border-white/30 dark:bg-white/85 dark:text-[#213547]/80 dark:hover:bg-white/95 dark:hover:text-[#213547]/95"
      title="设置"
      @click="openSettings"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- 时间和日期 -->
    <div class="mb-12 text-center md:mb-10">
      <h1
        class="mb-5 text-[5.5rem] leading-none font-extralight tracking-widest text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] md:mb-4 md:text-[3.5rem] dark:text-[#213547] dark:drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
      >
        {{ time }}
      </h1>
      <p class="text-2xl font-light tracking-wide text-white/90 md:text-[1.2rem] dark:text-[#213547]/90">
        {{ date }}
      </p>
    </div>

    <!-- 搜索框 -->
    <div class="mb-8 w-full md:mb-6">
      <SearchBox />
    </div>

    <!-- 访问历史 -->
    <HistoryList />

    <!-- 设置模态框 -->
    <SettingsModal :show="showSettings" @close="closeSettings" />
  </div>
</template>
