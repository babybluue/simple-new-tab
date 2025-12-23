<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import { performSearch } from '@/utils/search'
import { getSettings, type Settings } from '@/utils/storage'

const query = ref('')
const settings = ref<Settings | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)

onMounted(async () => {
  settings.value = await getSettings()
  // 自动聚焦搜索框
  searchInput.value?.focus()
})

const handleSearch = () => {
  if (!query.value.trim() || !settings.value) return
  performSearch(query.value, settings.value.searchEngine)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}
</script>

<template>
  <div class="mx-auto w-full max-w-[640px]">
    <div
      class="relative flex items-center rounded-3xl border border-white/30 bg-white/98 px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 focus-within:-translate-y-1 focus-within:scale-[1.02] focus-within:shadow-[0_12px_48px_rgba(0,0,0,0.18)] dark:border-white/20 dark:bg-white/12 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] dark:backdrop-blur-xl dark:focus-within:shadow-[0_12px_48px_rgba(0,0,0,0.4)]"
    >
      <svg
        class="mr-4 h-5 w-5 flex-shrink-0 text-gray-500 dark:text-white/60"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        ref="searchInput"
        v-model="query"
        type="text"
        class="flex-1 border-none bg-transparent text-base font-normal text-gray-900 outline-none placeholder:text-gray-400 md:text-lg dark:text-white/95 dark:placeholder:text-white/50"
        placeholder="搜索或输入网址..."
        @keydown="handleKeydown"
      />
      <button
        v-if="query"
        class="ml-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 text-gray-400 transition-all duration-200 hover:scale-110 hover:bg-gray-100/50 hover:text-gray-600 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white/80"
        @click="query = ''"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-5 w-5">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>
