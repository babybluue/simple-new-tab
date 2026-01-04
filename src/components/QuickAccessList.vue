<template>
  <section class="mx-auto mt-8 w-full max-w-7xl md:mt-6" :aria-label="t('quickAccess.title')">
    <header class="mb-4 flex justify-between gap-3 md:mb-3 md:flex-row md:items-center">
      <h2 class="text-app text-left text-xl font-semibold tracking-tight md:text-lg">{{ t('quickAccess.title') }}</h2>
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <button
            ref="presetToggleRef"
            data-quick-access-toggle
            class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app flex min-w-[80px] cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition md:text-xs"
            type="button"
            :aria-expanded="isPresetMenuOpen"
            @click.stop="togglePresetMenu"
          >
            <span>{{ t('quickAccess.addPreset') }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 transition"
              :class="{ 'rotate-180': isPresetMenuOpen }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <PresetMenu
            :open="isPresetMenuOpen"
            :presets="presetOptions"
            :position="menuPosition"
            @select="handleAddPreset"
          />
        </div>
        <div class="relative">
          <button
            ref="bookmarkToggleRef"
            data-quick-access-bookmark-toggle
            class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app flex min-w-[80px] cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition md:text-xs"
            type="button"
            :aria-expanded="isBookmarkMenuOpen"
            @click.stop="toggleBookmarkMenu"
          >
            <span>{{ t('quickAccess.addFromBookmark') }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 transition"
              :class="{ 'rotate-180': isBookmarkMenuOpen }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <BookmarkMenu
            :open="isBookmarkMenuOpen"
            :existing-urls="existingQuickLinkUrls"
            :position="bookmarkMenuPosition"
            :use-local-favicon="settings?.useLocalFavicon"
            @select="handleAddBookmark"
          />
        </div>
        <button
          class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app flex min-w-[80px] cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition md:text-xs"
          type="button"
          :aria-expanded="isFormVisible"
          @click="handleToggleForm"
        >
          <span>{{ isFormVisible ? t('quickAccess.collapseForm') : t('quickAccess.addCustom') }}</span>
        </button>
      </div>
    </header>

    <QuickLinkForm
      :visible="isFormVisible"
      :editing-link="editingLink"
      @submit="handleFormSubmit"
      @cancel="resetForm"
    />

    <ul
      v-if="quickLinks.length > 0"
      class="grid"
      :class="
        settings?.iconOnlyLinkCards
          ? 'grid-cols-[repeat(auto-fill,minmax(96px,1fr))] justify-items-center gap-x-4 gap-y-0 md:grid-cols-[repeat(auto-fill,minmax(88px,1fr))] md:gap-x-3 md:gap-y-0'
          : 'grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3 md:grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))]'
      "
      role="list"
    >
      <li
        v-for="link in quickLinks"
        :key="link.domain || link.url"
        :data-quick-link-key="link.domain || link.url"
        class="relative"
        :class="{
          'opacity-60': draggingKey === (link.domain || link.url),
          'ring-app/30 ring-2': dragOverKey === (link.domain || link.url) && draggingKey !== (link.domain || link.url),
        }"
        @dragenter.prevent="handleDragEnter(link)"
        @dragover.prevent="handleDragOver"
        @drop.prevent="handleDrop"
      >
        <LinkCard
          :title="getLocalizedSiteTitle(link.url, getLocale(), link.title) || link.domain || link.url"
          :subtitle="link.domain || link.url"
          v-bind="getSiteIconProps(link)"
          :fallback-char="(link.title || link.domain || link.url).charAt(0).toUpperCase()"
          :card-style="cardStyle"
          :icon-only="settings?.iconOnlyLinkCards"
          @select="handleQuickLinkSelect(link)"
          @icon-error="handleFaviconErrorWrapper(link, $event)"
        >
          <template #actions>
            <button
              class="text-app-secondary hover:text-app flex cursor-grab items-center justify-center border-none transition active:cursor-grabbing"
              :class="
                settings?.iconOnlyLinkCards
                  ? 'hover:bg-app-overlay h-6 w-6 rounded-md bg-transparent opacity-70 hover:opacity-100'
                  : 'bg-app-overlay bg-app-overlay-hover h-7 w-7 rounded-lg hover:scale-[1.06] md:h-6 md:w-6'
              "
              type="button"
              draggable="true"
              :aria-label="t('quickAccess.dragToReorder')"
              :title="t('quickAccess.dragToReorder')"
              @click.stop
              @dragstart.stop="handleDragStart(link, $event)"
              @dragend.stop="handleDragEnd"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                class="h-4 w-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01"
                />
              </svg>
            </button>
            <button
              class="text-app-secondary hover:text-app flex cursor-pointer items-center justify-center border-none transition"
              :class="
                settings?.iconOnlyLinkCards
                  ? 'hover:bg-app-overlay h-6 w-6 rounded-md bg-transparent opacity-70 hover:opacity-100'
                  : 'bg-app-overlay bg-app-overlay-hover h-7 w-7 rounded-lg hover:scale-[1.06] md:h-6 md:w-6'
              "
              type="button"
              @click.stop="startEdit(link)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                class="h-4 w-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15.232 5.232l3.536 3.536M4 20h4l10.5-10.5a1.5 1.5 0 000-2.121l-2.879-2.879a1.5 1.5 0 00-2.121 0L4 15v5z"
                />
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
              @click.stop="handleRemove(link)"
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
    <p
      v-else
      class="border-app bg-app-overlay text-app-tertiary flex flex-col items-center justify-center rounded-2xl border py-8 text-sm"
    >
      {{ t('quickAccess.emptyMessage') }}
    </p>
  </section>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

import { getLocale } from '@/i18n'
import { useI18n } from '@/i18n/composable'
import { type FaviconItem, getSiteFavicon, getUnavatarFavicon, handleFaviconError } from '@/utils/favicon'
import { getLocalizedSiteTitle, PRESET_QUICK_LINKS } from '@/utils/presets'
import { performSearch } from '@/utils/search'
import { resolveSiteIcon } from '@/utils/siteIcon'
import {
  addQuickLink,
  getQuickLinks,
  getSettings,
  removeQuickLink,
  saveQuickLinks,
  type Settings,
} from '@/utils/storage'
import { getCardStyle } from '@/utils/theme'
import type { QuickLink } from '@/utils/types'
import { extractDomainFromUrl } from '@/utils/url'

import BookmarkMenu from './BookmarkMenu.vue'
import LinkCard from './LinkCard.vue'
import PresetMenu, { type PresetOption } from './PresetMenu.vue'
import QuickLinkForm from './QuickLinkForm.vue'

import type { BookmarkItem } from '@/utils/bookmarks'

const { t } = useI18n()

const quickLinks = ref<QuickLink[]>([])
const settings = ref<Settings | null>(null)
const isFormVisible = ref(false)
const isPresetMenuOpen = ref(false)
const isBookmarkMenuOpen = ref(false)
const editingLink = ref<QuickLink | null>(null)
const faviconFallbackTried = ref<Record<string, boolean>>({})
const presetToggleRef = ref<HTMLElement | null>(null)
const bookmarkToggleRef = ref<HTMLElement | null>(null)
const menuPosition = ref<{ top: number; left: number; maxHeight: number }>({ top: 0, left: 0, maxHeight: 420 })
const bookmarkMenuPosition = ref<{ top: number; left: number; maxHeight: number }>({ top: 0, left: 0, maxHeight: 420 })

const draggingKey = ref<string | null>(null)
const dragOverKey = ref<string | null>(null)
const hasDraggedOrderChange = ref(false)
const isPersistingOrder = ref(false)

const getSiteIconProps = (link: QuickLink): { logo?: string; favicon?: string } => {
  return resolveSiteIcon(
    { url: link.url, domain: link.domain, logo: link.logo, favicon: link.favicon, useLocalFavicon: link.useLocalFavicon },
    settings.value?.useLocalFavicon ?? false
  )
}

const buildPresetWithMeta = (preset: QuickLink): QuickLink => {
  const domain = preset.domain || extractDomainFromUrl(preset.url)
  const favicon = preset.logo
    ? undefined
    : preset.favicon || getUnavatarFavicon({ domain, url: preset.url }) || getSiteFavicon({ domain, url: preset.url })
  return { ...preset, domain, favicon }
}

const presetOptions = computed<PresetOption[]>(() => {
  const domains = quickLinks.value.map(link => link.domain || extractDomainFromUrl(link.url))
  const currentLocale = getLocale()
  return PRESET_QUICK_LINKS.map(buildPresetWithMeta).map(preset => {
    const domain = preset.domain || extractDomainFromUrl(preset.url)
    const added = domains.includes(domain) || quickLinks.value.some(link => link.url === preset.url)
    const localizedTitle = getLocalizedSiteTitle(preset.url, currentLocale, preset.title)
    return { ...preset, title: localizedTitle, added }
  })
})

const cardStyle = computed(() => getCardStyle())

const existingQuickLinkUrls = computed(() => quickLinks.value.map(link => link.url))

const calculateMenuPosition = (el: HTMLElement | null) => {
  if (!el) return { top: 0, left: 0, maxHeight: 420 }
  const rect = el.getBoundingClientRect()
  const menuWidth = 288 // w-72
  const margin = 12
  const gap = 8
  let left = rect.right - menuWidth
  left = Math.min(Math.max(left, margin), window.innerWidth - menuWidth - margin)
  const top = Math.min(rect.bottom + gap, window.innerHeight - margin)
  const available = Math.max(window.innerHeight - top - margin, 200)
  const maxHeight = Math.min(window.innerHeight * 0.7, available)
  return { top, left, maxHeight }
}

const updateMenuPosition = () => {
  menuPosition.value = calculateMenuPosition(presetToggleRef.value)
}

const updateBookmarkMenuPosition = () => {
  bookmarkMenuPosition.value = calculateMenuPosition(bookmarkToggleRef.value)
}

onMounted(async () => {
  settings.value = await getSettings()
  await loadQuickLinks()

  chrome.storage.onChanged.addListener(handleStorageChange)
  document.addEventListener('click', handleOutsideClick)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  chrome.storage.onChanged.removeListener(handleStorageChange)
  document.removeEventListener('click', handleOutsideClick)
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  updateMenuPosition()
  updateBookmarkMenuPosition()
}

const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
  if (changes.quickLinks) {
    // 拖拽排序落盘时会触发 onChanged，这里避免“自己写 -> 自己读”导致 UI 闪烁
    if (isPersistingOrder.value) return
    loadQuickLinks()
  }
  if (changes.settings) {
    settings.value = (changes.settings.newValue as Settings) || settings.value
  }
}

const handleOutsideClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement

  // Handle preset menu
  const presetMenu = target.closest('[data-quick-access-preset]')
  const presetToggle = target.closest('[data-quick-access-toggle]')
  if (!presetMenu && !presetToggle && isPresetMenuOpen.value) {
    isPresetMenuOpen.value = false
  }

  // Handle bookmark menu
  const bookmarkMenu = target.closest('[data-quick-access-bookmark]')
  const bookmarkToggle = target.closest('[data-quick-access-bookmark-toggle]')
  if (!bookmarkMenu && !bookmarkToggle && isBookmarkMenuOpen.value) {
    isBookmarkMenuOpen.value = false
  }
}

const loadQuickLinks = async () => {
  quickLinks.value = await getQuickLinks()
}

const handleQuickLinkSelect = async (link: QuickLink) => {
  if (draggingKey.value) return
  const engine = settings.value?.searchEngine ?? 'google'
  performSearch(link.url, engine, settings.value?.openLinksInNewTab ?? false)
  await addQuickLink(link) // 让最近使用的站点排前
  await loadQuickLinks()
}

const handleRemove = async (link: QuickLink) => {
  quickLinks.value = await removeQuickLink(link.url)
}

const handleAddPreset = async (preset: PresetOption) => {
  if (preset.added) {
    isPresetMenuOpen.value = false
    return
  }
  quickLinks.value = await addQuickLink(preset)
}

const startEdit = (link: QuickLink) => {
  editingLink.value = link
  isFormVisible.value = true
}

const handleFormSubmit = async (data: { title: string; url: string; favicon?: string; useLocalFavicon?: boolean }) => {
  const originalKey = editingLink.value?.url
  const originalDomain = originalKey ? extractDomainFromUrl(originalKey) : null
  const nextDomain = extractDomainFromUrl(data.url)

  if (editingLink.value && originalKey && (originalKey !== data.url || originalDomain !== nextDomain)) {
    await removeQuickLink(originalKey)
  }

  quickLinks.value = await addQuickLink(data)
  resetForm()
}

const togglePresetMenu = async () => {
  isPresetMenuOpen.value = !isPresetMenuOpen.value
  if (isPresetMenuOpen.value) {
    isBookmarkMenuOpen.value = false // Close bookmark menu when opening preset menu
    await nextTick()
    updateMenuPosition()
  }
}

const toggleBookmarkMenu = async () => {
  isBookmarkMenuOpen.value = !isBookmarkMenuOpen.value
  if (isBookmarkMenuOpen.value) {
    isPresetMenuOpen.value = false // Close preset menu when opening bookmark menu
    await nextTick()
    updateBookmarkMenuPosition()
  }
}

const handleAddBookmark = async (bookmark: BookmarkItem) => {
  if (bookmark.added) {
    isBookmarkMenuOpen.value = false
    return
  }
  quickLinks.value = await addQuickLink(bookmark)
}

const handleToggleForm = () => {
  if (isFormVisible.value) {
    resetForm()
  } else {
    isFormVisible.value = true
  }
}

const resetForm = () => {
  editingLink.value = null
  isFormVisible.value = false
}

const handleFaviconErrorWrapper = (link: QuickLink, e: Event) => {
  handleFaviconError(link as FaviconItem, e, faviconFallbackTried.value)
}

const getQuickLinkKey = (link: QuickLink): string => {
  return link.domain || link.url
}

const moveQuickLink = (fromIndex: number, toIndex: number) => {
  const list = [...quickLinks.value]
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) return
  if (fromIndex === toIndex) return
  const [moved] = list.splice(fromIndex, 1)
  list.splice(toIndex, 0, moved)
  quickLinks.value = list
  hasDraggedOrderChange.value = true
}

const handleDragStart = (link: QuickLink, e: DragEvent) => {
  const key = getQuickLinkKey(link)
  draggingKey.value = key
  dragOverKey.value = null
  hasDraggedOrderChange.value = false

  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', key)
  }
}

const handleDragEnter = (target: QuickLink) => {
  if (!draggingKey.value) return
  const targetKey = getQuickLinkKey(target)
  dragOverKey.value = targetKey

  const fromIndex = quickLinks.value.findIndex(l => getQuickLinkKey(l) === draggingKey.value)
  const toIndex = quickLinks.value.findIndex(l => getQuickLinkKey(l) === targetKey)
  moveQuickLink(fromIndex, toIndex)
}

const handleDragOver = (e: DragEvent) => {
  if (!draggingKey.value) return
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

const persistQuickLinksOrderIfNeeded = async () => {
  if (!hasDraggedOrderChange.value) return
  isPersistingOrder.value = true
  try {
    await saveQuickLinks(quickLinks.value)
  } finally {
    // 等 storage.onChanged 回调走完，避免刚 set 就被 load 覆盖
    setTimeout(() => {
      isPersistingOrder.value = false
    }, 50)
  }
}

const handleDrop = async () => {
  await persistQuickLinksOrderIfNeeded()
  draggingKey.value = null
  dragOverKey.value = null
}

const handleDragEnd = async () => {
  await persistQuickLinksOrderIfNeeded()
  draggingKey.value = null
  dragOverKey.value = null
}
</script>
