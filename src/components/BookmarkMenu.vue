<template>
  <Teleport to="body">
    <div
      v-if="open"
      data-quick-access-bookmark
      class="border-app menu-app fixed z-50 w-72 overflow-hidden rounded-lg border shadow-(--app-shadow-md) backdrop-blur-sm"
      :style="{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: `${position.maxHeight}px`,
      }"
    >
      <div class="text-app-tertiary flex items-center justify-between px-3 py-2 text-[11px]">
        <span>{{ t('bookmarkMenu.selectFromBookmarks') }}</span>
        <span>{{ hasAvailableBookmarks ? t('bookmarkMenu.clickToAdd') : t('bookmarkMenu.allAdded') }}</span>
      </div>
      <div class="px-3 pb-2">
        <input
          v-model="searchQuery"
          type="search"
          autocomplete="off"
          class="border-app bg-app-overlay text-app placeholder:text-app-tertiary h-8 w-full rounded-md border px-2 text-xs ring-2 ring-transparent outline-none focus:border-(--app-border-color-hover) focus:ring-(--app-focus-ring)"
          :placeholder="t('bookmarkMenu.searchOrFilter')"
        />
      </div>
      <div v-if="loading" class="flex items-center justify-center py-8">
        <svg
          class="text-app-tertiary h-5 w-5 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      <div v-else class="overflow-auto p-1" :style="{ maxHeight: `${Math.max(position.maxHeight - 92, 160)}px` }">
        <button
          v-for="bookmark in filteredBookmarks"
          :key="bookmark.url"
          type="button"
          class="menu-item-app group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="bookmark.added"
          @click.stop="$emit('select', bookmark)"
        >
          <img
            v-if="bookmark.logo || bookmark.favicon"
            :src="bookmark.logo || bookmark.favicon"
            :alt="bookmark.title"
            class="h-5 w-5 rounded transition group-hover:scale-105"
          />
          <div
            v-else
            class="bg-app-overlay text-app-secondary flex h-5 w-5 items-center justify-center rounded text-xs font-medium"
          >
            {{ (bookmark.title || bookmark.domain || bookmark.url).charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1 text-left">
            <div class="flex items-center gap-2">
              <span class="min-w-0 truncate">{{ bookmark.title }}</span>
              <span v-if="bookmark.added" class="text-app-tertiary shrink-0 whitespace-nowrap text-[11px]">{{ t('bookmarkMenu.added') }}</span>
            </div>
            <p class="text-app-tertiary truncate text-[11px]">{{ bookmark.domain }}</p>
          </div>
          <span
            v-if="!bookmark.added"
            class="badge-primary cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-medium"
          >
            {{ t('bookmarkMenu.add') }}
          </span>
        </button>
        <div v-if="!filteredBookmarks.length && !loading" class="text-app-tertiary px-3 py-6 text-center text-[12px]">
          {{ bookmarks.length === 0 ? t('bookmarkMenu.noBookmarks') : t('bookmarkMenu.noMatches') }}
        </div>
      </div>
      <div v-if="!hasAvailableBookmarks && !loading && bookmarks.length > 0" class="text-app-tertiary px-3 pb-3 text-[11px]">
        {{ t('bookmarkMenu.allBookmarksAdded') }}
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import { useI18n } from '@/i18n/composable'
import { type BookmarkItem, getAllBookmarks } from '@/utils/bookmarks'
import { extractDomainFromUrl } from '@/utils/url'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  existingUrls: string[]
  position: { top: number; left: number; maxHeight: number }
  /** 是否使用本地缓存的 favicon */
  useLocalFavicon?: boolean
}>()

defineEmits<{
  select: [bookmark: BookmarkItem]
}>()

const searchQuery = ref('')
const bookmarks = ref<BookmarkItem[]>([])
const loading = ref(false)

const bookmarksWithAddedState = computed(() => {
  const existingDomains = props.existingUrls.map(url => extractDomainFromUrl(url))
  return bookmarks.value.map(bookmark => {
    const domain = bookmark.domain || extractDomainFromUrl(bookmark.url)
    const added = props.existingUrls.includes(bookmark.url) || existingDomains.includes(domain)
    return { ...bookmark, added }
  })
})

const hasAvailableBookmarks = computed(() => bookmarksWithAddedState.value.some(bookmark => !bookmark.added))

const filteredBookmarks = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  const list = bookmarksWithAddedState.value
  if (!keyword) return list
  return list.filter(bookmark => {
    const title = (bookmark.title || '').toLowerCase()
    const domain = (bookmark.domain || '').toLowerCase()
    return title.includes(keyword) || domain.includes(keyword)
  })
})

const loadBookmarks = async () => {
  loading.value = true
  try {
    bookmarks.value = await getAllBookmarks(props.useLocalFavicon ?? false)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.open,
  async newVal => {
    if (newVal) {
      searchQuery.value = ''
      await loadBookmarks()
    }
  }
)
</script>

