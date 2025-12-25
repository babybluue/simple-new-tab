<template>
  <section class="mx-auto mt-8 w-full max-w-7xl px-6 md:mt-6 md:px-5" aria-label="快速访问">
    <header class="mb-4 flex flex-col gap-3 md:mb-3 md:flex-row md:items-center md:justify-between">
      <h2 class="text-left text-xl font-semibold tracking-tight text-white/95 md:text-lg dark:text-[#213547]/95">
        快速访问
      </h2>
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <button
            ref="presetToggleRef"
            data-quick-access-toggle
            class="flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/25 hover:bg-white/20 hover:text-white md:text-xs dark:border-[#213547]/25 dark:bg-white/80 dark:text-[#213547]/80 dark:hover:border-[#213547]/35 dark:hover:bg-white/90 dark:hover:text-[#213547]"
            type="button"
            :aria-expanded="isPresetMenuOpen"
            @click.stop="togglePresetMenu"
          >
            <span>添加预设</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
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
        <button
          class="flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/25 hover:bg-white/20 hover:text-white md:text-xs dark:border-[#213547]/25 dark:bg-white/80 dark:text-[#213547]/80 dark:hover:border-[#213547]/35 dark:hover:bg-white/90 dark:hover:text-[#213547]"
          type="button"
          :aria-expanded="isFormVisible"
          @click="handleToggleForm"
        >
          <span>{{ isFormVisible ? '收起表单' : '添加自定义' }}</span>
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
      class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]"
      role="list"
    >
      <li v-for="link in quickLinks" :key="link.domain || link.url">
        <LinkCard
          :title="link.title"
          :subtitle="link.domain || link.url"
          :favicon="getFavicon(link as FaviconItem)"
          :fallback-char="link.title.charAt(0).toUpperCase()"
          :card-style="cardStyle"
          @select="handleQuickLinkSelect(link)"
          @icon-error="handleFaviconErrorWrapper(link, $event)"
        >
          <template #actions>
            <button
              class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-black/25 text-white/80 hover:scale-110 hover:bg-white/20 hover:text-white md:h-6 md:w-6 dark:bg-black/10 dark:text-[#213547]/70 dark:hover:bg-white/30 dark:hover:text-[#213547]/95"
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
              class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-black/25 text-white/80 hover:scale-110 hover:bg-red-500/30 hover:text-white md:h-6 md:w-6 dark:bg-black/10 dark:text-[#213547]/70 dark:hover:bg-red-500/20 dark:hover:text-[#213547]/95"
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
      class="flex flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/10 py-8 text-sm text-white/70 dark:border-white/30 dark:bg-white/85 dark:text-[#213547]/70"
    >
      暂无快速访问站点，点击上方按钮添加一个吧～
    </p>
  </section>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

import { type FaviconItem, getFavicon, getGoogleFavicon, getSiteFavicon, handleFaviconError } from '@/utils/favicon'
import { PRESET_QUICK_LINKS } from '@/utils/presets'
import { performSearch } from '@/utils/search'
import { addQuickLink, getQuickLinks, getSettings, removeQuickLink, type Settings } from '@/utils/storage'
import { buildPrimarySurfaceStyle } from '@/utils/theme'
import type { QuickLink } from '@/utils/types'
import { extractDomainFromUrl } from '@/utils/url'

import LinkCard from './LinkCard.vue'
import PresetMenu, { type PresetOption } from './PresetMenu.vue'
import QuickLinkForm from './QuickLinkForm.vue'

const quickLinks = ref<QuickLink[]>([])
const settings = ref<Settings | null>(null)
const isFormVisible = ref(false)
const isPresetMenuOpen = ref(false)
const editingLink = ref<QuickLink | null>(null)
const faviconFallbackTried = ref<Record<string, boolean>>({})
const presetToggleRef = ref<HTMLElement | null>(null)
const menuPosition = ref<{ top: number; left: number; maxHeight: number }>({ top: 0, left: 0, maxHeight: 420 })

const buildPresetWithMeta = (preset: QuickLink): QuickLink => {
  const domain = preset.domain || extractDomainFromUrl(preset.url)
  const favicon =
    preset.favicon || getGoogleFavicon({ domain, url: preset.url }) || getSiteFavicon({ domain, url: preset.url })
  return { ...preset, domain, favicon }
}

const presetOptions = computed<PresetOption[]>(() => {
  const domains = quickLinks.value.map(link => link.domain || extractDomainFromUrl(link.url))
  return PRESET_QUICK_LINKS.map(buildPresetWithMeta).map(preset => {
    const domain = preset.domain || extractDomainFromUrl(preset.url)
    const added = domains.includes(domain) || quickLinks.value.some(link => link.url === preset.url)
    return { ...preset, added }
  })
})

const cardStyle = computed(() => {
  return buildPrimarySurfaceStyle(settings.value?.primaryColor)
})

const updateMenuPosition = () => {
  const el = presetToggleRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const menuWidth = 288 // w-72
  const margin = 12
  const gap = 8
  let left = rect.right - menuWidth
  left = Math.min(Math.max(left, margin), window.innerWidth - menuWidth - margin)
  const top = Math.min(rect.bottom + gap, window.innerHeight - margin)
  const available = Math.max(window.innerHeight - top - margin, 200)
  const maxHeight = Math.min(window.innerHeight * 0.7, available)
  menuPosition.value = { top, left, maxHeight }
}

onMounted(async () => {
  settings.value = await getSettings()
  await loadQuickLinks()

  chrome.storage.onChanged.addListener(handleStorageChange)
  document.addEventListener('click', handleOutsideClick)
  window.addEventListener('resize', updateMenuPosition)
})

onUnmounted(() => {
  chrome.storage.onChanged.removeListener(handleStorageChange)
  document.removeEventListener('click', handleOutsideClick)
  window.removeEventListener('resize', updateMenuPosition)
})

const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
  if (changes.quickLinks) {
    loadQuickLinks()
  }
  if (changes.settings) {
    settings.value = (changes.settings.newValue as Settings) || settings.value
  }
}

const handleOutsideClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const menu = target.closest('[data-quick-access-preset]')
  const toggle = target.closest('[data-quick-access-toggle]')
  if (!menu && !toggle && isPresetMenuOpen.value) {
    isPresetMenuOpen.value = false
  }
}

const loadQuickLinks = async () => {
  quickLinks.value = await getQuickLinks()
}

const handleQuickLinkSelect = async (link: QuickLink) => {
  const engine = settings.value?.searchEngine ?? 'google'
  performSearch(link.url, engine)
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

const handleFormSubmit = async (data: { title: string; url: string; favicon?: string }) => {
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
    await nextTick()
    updateMenuPosition()
  }
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
</script>
