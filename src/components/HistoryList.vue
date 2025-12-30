<template>
  <section class="mx-auto mt-12 w-full max-w-7xl" :aria-label="t('history.title')">
    <header class="mb-6 flex items-center justify-between md:mb-5">
      <h2 class="text-app text-left text-xl font-semibold tracking-tight md:text-lg">{{ t('history.title') }}</h2>
      <button
        v-if="history.length > 0"
        class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition md:text-xs"
        type="button"
        :aria-expanded="!isCollapsed"
        :aria-controls="'history-list'"
        @click="toggleCollapse"
      >
        <span>{{ isCollapsed ? t('common.expand') : t('common.collapse') }}</span>
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
      v-if="!isCollapsed && history.length > 0"
      id="history-list"
      class="grid"
      :class="
        settings?.iconOnlyLinkCards
          ? 'grid-cols-[repeat(auto-fill,minmax(96px,1fr))] justify-items-center gap-x-4 gap-y-0 md:grid-cols-[repeat(auto-fill,minmax(88px,1fr))] md:gap-x-3 md:gap-y-0'
          : 'grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4 md:grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] md:gap-3'
      "
      role="list"
    >
      <li v-for="item in history" :key="item.domain || item.url">
        <LinkCard
          :title="(item.title || item.domain || item.url).trim()"
          :subtitle="item.domain || item.url"
          v-bind="getSiteIconProps(item)"
          :fallback-char="((item.title || item.domain || item.url || '?').trim().charAt(0) || '?').toUpperCase()"
          :card-style="cardStyle"
          :icon-only="settings?.iconOnlyLinkCards"
          @select="handleSelect(item)"
          @icon-error="handleFaviconErrorWrapper(item, $event)"
        >
          <template #actions>
            <button
              class="text-app-secondary hover:text-app flex cursor-pointer items-center justify-center border-none transition"
              :class="
                settings?.iconOnlyLinkCards
                  ? 'hover:bg-app-overlay h-6 w-6 rounded-md bg-transparent opacity-70 hover:opacity-100'
                  : 'bg-app-overlay bg-app-overlay-hover h-7 w-7 rounded-lg hover:scale-[1.06] md:h-6 md:w-6'
              "
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
              class="text-app-secondary hover:text-app flex cursor-pointer items-center justify-center border-none transition"
              :class="
                settings?.iconOnlyLinkCards
                  ? 'hover:bg-app-overlay h-6 w-6 rounded-md bg-transparent opacity-70 hover:text-red-500 hover:opacity-100'
                  : 'bg-app-overlay bg-app-overlay-hover h-7 w-7 rounded-lg hover:scale-[1.06] hover:bg-red-500/30 md:h-6 md:w-6 dark:hover:bg-red-500/20'
              "
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

import { useI18n } from '@/i18n/composable'
import { type FaviconItem, handleFaviconError } from '@/utils/favicon'
import { performSearch } from '@/utils/search'
import { resolveSiteIcon } from '@/utils/siteIcon'
import {
  addQuickLink,
  getHistory,
  getSettings,
  type HistoryItem,
  removeHistoryItem,
  type Settings,
} from '@/utils/storage'
import { getCardStyle } from '@/utils/theme'
import { extractDomainFromUrl, extractRootDomain } from '@/utils/url'

import LinkCard from './LinkCard.vue'

const { t } = useI18n()

const history = ref<HistoryItem[]>([])
const settings = ref<Settings | null>(null)
const isCollapsed = ref(false)
const faviconFallbackTried = ref<Record<string, boolean>>({})

// 常量
const MIN_VISIT_THRESHOLD = 2
const DEFAULT_VISIT_COUNT = 1


const getSiteIconProps = (item: HistoryItem): { logo?: string; favicon?: string } => {
  return resolveSiteIcon({ url: item.url, domain: item.domain, favicon: item.favicon })
}

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
    // 使用主域名进行去重判断
    const rootDomain = extractRootDomain(domain)
    const existing = domainMap.get(rootDomain)

    if (!existing) {
      domainMap.set(rootDomain, item)
    } else {
      // 保留访问次数最多的，如果访问次数相同则保留最近访问的
      const existingCount = existing.visitCount ?? DEFAULT_VISIT_COUNT
      const currentCount = item.visitCount ?? DEFAULT_VISIT_COUNT
      const existingTimestamp = existing.timestamp || 0
      const currentTimestamp = item.timestamp || 0

      if (currentCount > existingCount || (currentCount === existingCount && currentTimestamp > existingTimestamp)) {
        domainMap.set(rootDomain, item)
      }
    }
  }

  return Array.from(domainMap.values())
}

const loadHistory = async () => {
  const allHistory = await getHistory()
  const frequentSites = allHistory.filter(
    item => (item.visitCount ?? DEFAULT_VISIT_COUNT) >= MIN_VISIT_THRESHOLD
  )
  const filtered = frequentSites.length > 0 ? frequentSites : allHistory
  const safe = filtered
    .filter(item => typeof item?.url === 'string' && item.url.trim())
    .map(item => {
      const url = item.url.trim()
      const domain = item.domain || extractDomainFromUrl(url)
      const title = (item.title || '').trim() || domain || url
      return { ...item, url, domain, title }
    })
  // 对相同域名的记录进行去重
  history.value = deduplicateByDomain(safe)
}

const handleSelect = async (item: HistoryItem) => {
  if (!settings.value) return
  performSearch(item.url, settings.value.searchEngine, settings.value.openLinksInNewTab)

  const { addHistory } = await import('@/utils/storage')
  await addHistory({ ...item, timestamp: Date.now() })
}

const handleRemove = async (item: HistoryItem) => {
  await removeHistoryItem(item.url)
  await loadHistory()
}

const handlePin = async (item: HistoryItem) => {
  await addQuickLink({
    title: item.title,
    url: item.url,
  })
}

const cardStyle = computed(() => getCardStyle())

const handleFaviconErrorWrapper = (item: HistoryItem, e: Event) => {
  handleFaviconError(item as FaviconItem, e, faviconFallbackTried.value)
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>
