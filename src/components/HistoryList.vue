<template>
  <div v-if="history.length > 0" class="mx-auto mt-12 w-full max-w-7xl px-6 md:px-5">
    <div class="mb-6 flex items-center justify-between md:mb-5">
      <h3 class="text-left text-xl font-semibold tracking-tight text-white/95 md:text-lg dark:text-[#213547]/95">
        最近访问
      </h3>
      <button
        class="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/25 hover:bg-white/20 hover:text-white md:text-xs dark:border-[#213547]/25 dark:bg-white/80 dark:text-[#213547]/80 dark:hover:border-[#213547]/35 dark:hover:bg-white/90 dark:hover:text-[#213547]"
        :aria-expanded="!isCollapsed"
        @click="toggleCollapse"
      >
        <span>{{ isCollapsed ? '展开' : '收起' }}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          class="h-4 w-4 transition"
          :class="{ 'rotate-180': !isCollapsed }"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
    <div
      v-if="!isCollapsed"
      class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] md:gap-3"
    >
      <div
        v-for="item in history"
        :key="item.domain || item.url"
        class="group relative flex cursor-pointer items-center gap-4 rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/25 hover:shadow-xl md:gap-3 md:p-3.5 dark:border-white/30 dark:bg-white/85 dark:hover:border-white/40 dark:hover:bg-white/95 dark:hover:shadow-2xl"
        @click="handleClick(item)"
      >
        <div
          class="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/20 shadow-md ring-2 ring-white/10 md:h-11 md:w-11 dark:bg-white/15 dark:ring-white/20"
        >
          <img
            v-if="getFavicon(item)"
            :src="getFavicon(item)"
            :alt="item.title"
            class="h-full w-full object-cover"
            @error="handleFaviconError(item, $event)"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center text-lg font-bold text-white/90 md:text-base dark:text-[#213547]/90"
          >
            {{ item.title.charAt(0).toUpperCase() }}
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <div
            class="mb-1.5 overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap text-white/95 md:mb-1 md:text-[13px] dark:text-[#213547]/95"
          >
            {{ item.title }}
          </div>
          <div
            class="mb-1 overflow-hidden text-xs text-ellipsis whitespace-nowrap text-white/65 md:mb-0.5 md:text-[11px] dark:text-[#213547]/65"
          >
            {{ item.domain || item.url }}
          </div>
        </div>
        <div class="absolute top-3 right-3 flex gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100 md:top-2.5 md:right-2.5">
          <button
            class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-black/25 text-white/80 hover:scale-110 hover:bg-white/20 hover:text-white md:h-6 md:w-6 dark:bg-black/10 dark:text-[#213547]/70 dark:hover:bg-white/30 dark:hover:text-[#213547]/95"
            @click="handlePin($event, item)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="h-4 w-4"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v18l7-5 7 5V3z" />
            </svg>
          </button>
          <button
            class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-black/25 text-white/80 hover:scale-110 hover:bg-red-500/30 hover:text-white md:h-6 md:w-6 dark:bg-black/10 dark:text-[#213547]/70 dark:hover:bg-red-500/20 dark:hover:text-[#213547]/95"
            @click="handleRemove($event, item)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import { performSearch } from '@/utils/search'
import { addQuickLink, getHistory, getSettings, removeHistoryItem, type HistoryItem } from '@/utils/storage'

const history = ref<HistoryItem[]>([])
const settings = ref<{ searchEngine: string } | null>(null)
const isCollapsed = ref(false)
const MIN_VISIT_THRESHOLD = 2
const faviconFallbackTried = ref<Record<string, boolean>>({})

onMounted(async () => {
  settings.value = await getSettings()
  await loadHistory()

  // 监听存储变化
  chrome.storage.onChanged.addListener(changes => {
    if (changes.history) {
      loadHistory()
    }
    if (changes.settings) {
      const newSettings = changes.settings.newValue as { searchEngine: string }
      settings.value = newSettings || settings.value
    }
  })
})

const loadHistory = async () => {
  const allHistory = await getHistory()
  const frequentSites = allHistory.filter(item => (item.visitCount ?? 1) >= MIN_VISIT_THRESHOLD)
  history.value = frequentSites.length > 0 ? frequentSites : allHistory
}

const handleClick = async (item: HistoryItem) => {
  if (!settings.value) return
  performSearch(item.url, settings.value.searchEngine)

  const { addHistory } = await import('@/utils/storage')
  await addHistory({ ...item, timestamp: Date.now() })
}

const handleRemove = async (e: MouseEvent, item: HistoryItem) => {
  e.stopPropagation()
  await removeHistoryItem(item.url)
  await loadHistory()
}

const handlePin = async (e: MouseEvent, item: HistoryItem) => {
  e.stopPropagation()
  await addQuickLink({
    title: item.title,
    url: item.url,
    favicon: getGoogleFavicon(item),
  })
}

const getDomain = (item: HistoryItem): string | null => {
  const target = item.domain || item.url
  try {
    const urlObj = new URL(target.startsWith('http') ? target : `https://${target}`)
    return urlObj.hostname
  } catch {
    return null
  }
}

const getSiteFavicon = (item: HistoryItem): string | undefined => {
  const domain = getDomain(item)
  return domain ? `https://${domain}/favicon.ico` : undefined
}

const getGoogleFavicon = (item: HistoryItem): string | undefined => {
  const domain = getDomain(item)
  return domain
    ? `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=32`
    : undefined
}

const getFavicon = (item: HistoryItem): string => {
  return getGoogleFavicon(item) || getSiteFavicon(item) || ''
}

const handleFaviconError = (item: HistoryItem, e: Event) => {
  const img = e.target as HTMLImageElement
  const key = item.domain || item.url
  if (faviconFallbackTried.value[key]) {
    img.style.display = 'none'
    return
  }
  const site = getSiteFavicon(item)
  if (site && img.src !== site) {
    faviconFallbackTried.value[key] = true
    img.src = site
    return
  }
  faviconFallbackTried.value[key] = true
  img.style.display = 'none'
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>
