<template>
  <section v-if="history.length > 0" class="mx-auto mt-12 w-full max-w-7xl px-6 md:px-5" aria-label="最近访问">
    <header class="mb-6 flex items-center justify-between md:mb-5">
      <h2 class="text-app text-left text-xl font-semibold tracking-tight md:text-lg">
        最近访问
      </h2>
      <button
        class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition md:text-xs"
        type="button"
        :aria-expanded="!isCollapsed"
        :aria-controls="'history-list'"
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
    </header>
    <ul
      v-if="!isCollapsed"
      id="history-list"
      class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] md:gap-3"
      role="list"
    >
      <li v-for="item in history" :key="item.domain || item.url">
        <LinkCard
          :title="item.title"
          :subtitle="item.domain || item.url"
          :favicon="getFavicon(item as FaviconItem)"
          :fallback-char="item.title.charAt(0).toUpperCase()"
          :card-style="cardStyle"
          @select="handleSelect(item)"
          @icon-error="handleFaviconErrorWrapper(item, $event)"
        >
          <template #actions>
            <button
              class="text-app-secondary hover:text-app flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-app-overlay bg-app-overlay-hover hover:scale-110 md:h-6 md:w-6"
              type="button"
              @click.stop="handlePin(item)"
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
              class="text-app-secondary hover:text-app flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-app-overlay bg-app-overlay-hover hover:scale-110 hover:bg-red-500/30 md:h-6 md:w-6 dark:hover:bg-red-500/20"
              type="button"
              @click.stop="handleRemove(item)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                class="h-4 w-4"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </template>
        </LinkCard>
      </li>
    </ul>
  </section>
</template>
<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

import { type FaviconItem, getFavicon, handleFaviconError } from '@/utils/favicon'
import { performSearch } from '@/utils/search'
import {
  addQuickLink,
  getHistory,
  getSettings,
  type HistoryItem,
  removeHistoryItem,
  type Settings,
} from '@/utils/storage'
import { buildPrimarySurfaceStyle } from '@/utils/theme'
import { extractDomainFromUrl } from '@/utils/url'

import LinkCard from './LinkCard.vue'

const history = ref<HistoryItem[]>([])
const settings = ref<Settings | null>(null)
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
      settings.value = (newSettings as Settings) || settings.value
    }
  })
})

const deduplicateByDomain = (items: HistoryItem[]): HistoryItem[] => {
  const domainMap = new Map<string, HistoryItem>()

  for (const item of items) {
    const domain = item.domain || extractDomainFromUrl(item.url) || item.url
    const existing = domainMap.get(domain)

    if (!existing) {
      domainMap.set(domain, item)
    } else {
      // 保留访问次数最多的，如果访问次数相同则保留最近访问的
      const existingCount = existing.visitCount ?? 1
      const currentCount = item.visitCount ?? 1
      const existingTimestamp = existing.timestamp || 0
      const currentTimestamp = item.timestamp || 0

      if (currentCount > existingCount || (currentCount === existingCount && currentTimestamp > existingTimestamp)) {
        domainMap.set(domain, item)
      }
    }
  }

  return Array.from(domainMap.values())
}

const loadHistory = async () => {
  const allHistory = await getHistory()
  const frequentSites = allHistory.filter(item => (item.visitCount ?? 1) >= MIN_VISIT_THRESHOLD)
  const filtered = frequentSites.length > 0 ? frequentSites : allHistory
  // 对相同域名的记录进行去重
  history.value = deduplicateByDomain(filtered)
}

const handleSelect = async (item: HistoryItem) => {
  if (!settings.value) return
  performSearch(item.url, settings.value.searchEngine)

  const { addHistory } = await import('@/utils/storage')
  await addHistory({ ...item, timestamp: Date.now() })
}

const handleRemove = async (item: HistoryItem) => {
  await removeHistoryItem(item.url)
  await loadHistory()
}

const handlePin = async (item: HistoryItem) => {
  const { getGoogleFavicon } = await import('@/utils/favicon')
  await addQuickLink({
    title: item.title,
    url: item.url,
    favicon: getGoogleFavicon(item as FaviconItem),
  })
}

const cardStyle = computed(() => {
  return buildPrimarySurfaceStyle(settings.value?.primaryColor)
})

const handleFaviconErrorWrapper = (item: HistoryItem, e: Event) => {
  handleFaviconError(item as FaviconItem, e, faviconFallbackTried.value)
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>
