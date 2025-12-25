<template>
  <section class="mx-auto mt-8 w-full max-w-7xl px-6 md:mt-6 md:px-5" aria-label="快速访问">
    <header class="mb-4 flex flex-col gap-3 md:mb-3 md:flex-row md:items-center md:justify-between">
      <h2 class="text-left text-xl font-semibold tracking-tight text-white/95 md:text-lg dark:text-[#213547]/95">
        快速访问
      </h2>
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <button
            data-quick-access-toggle
            class="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/25 hover:bg-white/20 hover:text-white md:text-xs dark:border-[#213547]/25 dark:bg-white/80 dark:text-[#213547]/80 dark:hover:border-[#213547]/35 dark:hover:bg-white/90 dark:hover:text-[#213547]"
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
          <div
            v-if="isPresetMenuOpen && availablePresets.length"
            data-quick-access-preset
            class="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-white/15 bg-white/95 p-1 shadow-xl dark:border-[#213547]/25 dark:bg-[#f6f7fb]"
          >
            <div
              v-for="preset in availablePresets"
              :key="preset.url"
              class="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-[#1f2937] transition hover:bg-black/5"
              @click="handleAddPreset(preset)"
            >
              <img v-if="preset.favicon" :src="preset.favicon" :alt="preset.title" class="h-4 w-4 rounded" />
              <span class="flex-1 truncate">{{ preset.title }}</span>
            </div>
            <div v-if="!availablePresets.length" class="px-3 py-2 text-xs text-gray-500">预设已全部添加</div>
          </div>
        </div>
        <button
          class="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/80 transition hover:border-white/25 hover:bg-white/20 hover:text-white md:text-xs dark:border-[#213547]/25 dark:bg-white/80 dark:text-[#213547]/80 dark:hover:border-[#213547]/35 dark:hover:bg-white/90 dark:hover:text-[#213547]"
          type="button"
          :aria-expanded="isFormVisible"
          @click="handleToggleForm"
        >
          <span>{{ isFormVisible ? '收起表单' : '添加自定义' }}</span>
        </button>
      </div>
    </header>

    <form
      v-if="isFormVisible"
      class="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-xl md:grid-cols-[1.1fr_1.5fr_1.2fr_auto] md:items-center md:gap-3 md:p-3 dark:border-white/30 dark:bg-white/85"
      aria-label="添加快速访问"
      @submit.prevent="handleSubmit"
    >
      <input
        v-model="form.title"
        type="text"
        class="w-full rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-sm text-[#1f2937] placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none dark:border-white/40 dark:bg-white/95"
        placeholder="网站名称（可选）"
        name="title"
      />
      <input
        v-model="form.url"
        type="text"
        class="w-full rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-sm text-[#1f2937] placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none dark:border-white/40 dark:bg-white/95"
        placeholder="网站链接，例如 https://example.com"
        required
        name="url"
      />
      <input
        v-model="form.icon"
        type="text"
        class="w-full rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-sm text-[#1f2937] placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none dark:border-white/40 dark:bg-white/95"
        placeholder="自定义图标 URL（可选）"
        name="icon"
      />
      <div class="flex items-center gap-2">
        <button
          type="submit"
          class="h-10 rounded-xl bg-indigo-500 px-4 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300 md:h-9"
          :disabled="!form.url.trim()"
        >
          {{ isEditing ? '保存' : '添加' }}
        </button>
        <button
          v-if="isEditing"
          type="button"
          class="h-10 rounded-xl border border-white/30 bg-transparent px-4 text-sm font-medium text-white/80 transition hover:border-white/50 hover:text-white md:h-9 dark:border-[#213547]/40 dark:text-[#213547]/80 dark:hover:border-[#213547]/60 dark:hover:text-[#213547]"
          @click="resetForm"
        >
          取消
        </button>
      </div>
    </form>

    <ul
      v-if="quickLinks.length > 0"
      class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]"
      role="list"
    >
      <li v-for="link in quickLinks" :key="link.domain || link.url">
        <LinkCard
          :title="link.title"
          :subtitle="link.domain || link.url"
          :favicon="getFavicon(link)"
          :fallback-char="link.title.charAt(0).toUpperCase()"
          :card-style="cardStyle"
          @select="handleQuickLinkSelect(link)"
          @icon-error="handleFaviconError(link, $event)"
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
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { normalizeURL, performSearch } from '@/utils/search'
import {
  addQuickLink,
  getQuickLinks,
  getSettings,
  PRESET_QUICK_LINKS,
  type QuickLink,
  removeQuickLink,
  type Settings,
} from '@/utils/storage'
import { buildPrimarySurfaceStyle } from '@/utils/theme'
import LinkCard from './LinkCard.vue'

const quickLinks = ref<QuickLink[]>([])
const settings = ref<Settings | null>(null)
const isFormVisible = ref(false)
const isPresetMenuOpen = ref(false)
const form = ref<{ title: string; url: string; icon: string }>({ title: '', url: '', icon: '' })
const isEditing = ref(false)
const editingKey = ref<string | null>(null)
const faviconFallbackTried = ref<Record<string, boolean>>({})

const getDomainFromUrl = (url: string): string => {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname
  } catch {
    return url
  }
}

const buildPresetWithMeta = (preset: QuickLink): QuickLink => {
  const domain = preset.domain || getDomainFromUrl(preset.url)
  const googleFavicon = domain
    ? `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=64`
    : undefined
  const siteFavicon = domain ? `https://${domain}/favicon.ico` : undefined
  const favicon = preset.favicon || googleFavicon || siteFavicon
  return { ...preset, domain, favicon }
}

const availablePresets = computed(() => {
  const domains = quickLinks.value.map(link => link.domain || getDomainFromUrl(link.url))
  return PRESET_QUICK_LINKS.map(buildPresetWithMeta).filter(preset => {
    const domain = preset.domain || getDomainFromUrl(preset.url)
    return !domains.includes(domain) && !quickLinks.value.some(link => link.url === preset.url)
  })
})

const cardStyle = computed(() => {
  return buildPrimarySurfaceStyle(settings.value?.primaryColor)
})

onMounted(async () => {
  settings.value = await getSettings()
  await loadQuickLinks()

  chrome.storage.onChanged.addListener(handleStorageChange)
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  chrome.storage.onChanged.removeListener(handleStorageChange)
  document.removeEventListener('click', handleOutsideClick)
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
  if (!menu && !toggle) {
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

const handleAddPreset = async (preset: QuickLink) => {
  isPresetMenuOpen.value = false
  quickLinks.value = await addQuickLink(preset)
}

const startEdit = (link: QuickLink) => {
  form.value = {
    title: link.title,
    url: link.url,
    icon: link.favicon || '',
  }
  isEditing.value = true
  editingKey.value = link.url
  showForm.value = true
}

const handleSubmit = async () => {
  if (!form.value.url.trim()) return

  const normalizedUrl = normalizeURL(form.value.url.trim())
  const title = form.value.title.trim() || getTitleFromUrl(normalizedUrl)
  const favicon = form.value.icon.trim() || undefined
  const originalKey = editingKey.value
  const originalDomain = originalKey ? getDomainFromUrl(originalKey) : null
  const nextDomain = getDomainFromUrl(normalizedUrl)

  if (isEditing.value && originalKey && (originalKey !== normalizedUrl || originalDomain !== nextDomain)) {
    await removeQuickLink(originalKey)
  }

  quickLinks.value = await addQuickLink({ title, url: normalizedUrl, favicon })
  resetForm()
}

const getTitleFromUrl = (url: string): string => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return host || url
  } catch {
    return url
  }
}

const togglePresetMenu = () => {
  isPresetMenuOpen.value = !isPresetMenuOpen.value
}

const handleToggleForm = () => {
  if (isFormVisible.value) {
    resetForm()
  } else {
    isFormVisible.value = true
  }
}

const resetForm = () => {
  form.value = { title: '', url: '', icon: '' }
  isEditing.value = false
  editingKey.value = null
  isFormVisible.value = false
}

const getSiteFavicon = (link: QuickLink): string | undefined => {
  const domain = link.domain || getDomainFromUrl(link.url)
  return domain ? `https://${domain}/favicon.ico` : undefined
}

const getGoogleFavicon = (link: QuickLink): string | undefined => {
  const domain = link.domain || getDomainFromUrl(link.url)
  return domain
    ? `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=64`
    : undefined
}

const getFavicon = (link: QuickLink): string | undefined => {
  const google = getGoogleFavicon(link)
  const site = getSiteFavicon(link)
  return link.favicon || google || site
}

const handleFaviconError = (link: QuickLink, e: Event) => {
  const img = e.target as HTMLImageElement
  const key = link.domain || link.url
  if (faviconFallbackTried.value[key]) {
    img.style.display = 'none'
    return
  }

  const site = getSiteFavicon(link)
  if (site && img.src !== site) {
    faviconFallbackTried.value[key] = true
    img.src = site
    return
  }

  faviconFallbackTried.value[key] = true
  img.style.display = 'none'
}
</script>
