<template>
  <form
    v-if="visible"
    class="border-app bg-app-overlay mb-4 grid grid-cols-1 gap-3 rounded-2xl border p-4 shadow-(--app-shadow-sm) backdrop-blur-xl md:gap-3 md:p-3"
    :aria-label="t('quickAccess.addCustom')"
    @submit.prevent="handleSubmit"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex w-full flex-1 items-center gap-2">
        <div
          class="border-app bg-app-overlay text-app-secondary flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-xs font-medium"
        >
          <img
            v-if="previewSrc"
            :src="previewSrc"
            alt=""
            class="h-full w-full object-contain p-1"
            @error="previewBroken = true"
            @load="previewBroken = false"
          />
          <span v-else class="px-0.5 text-center leading-none">—</span>
        </div>
        <input
          v-model="formData.title"
          type="text"
          class="border-app bg-app-overlay text-app placeholder:text-app-tertiary rounded-xl border px-3 py-2 text-sm ring-2 ring-transparent focus:border-(--app-border-color-hover) focus:ring-(--app-focus-ring) focus:outline-none"
          :placeholder="t('quickAccess.websiteName')"
          name="title"
        />
      </div>

      <input
        v-model="formData.url"
        type="text"
        class="border-app bg-app-overlay text-app placeholder:text-app-tertiary flex-1 rounded-xl border px-3 py-2 text-sm ring-2 ring-transparent focus:border-(--app-border-color-hover) focus:ring-(--app-focus-ring) focus:outline-none"
        :placeholder="t('quickAccess.websiteUrl')"
        required
        name="url"
      />
      <div class="flex flex-1 gap-2">
        <input
          v-model="formData.icon"
          type="text"
          class="border-app bg-app-overlay text-app placeholder:text-app-tertiary w-full rounded-xl border px-3 py-2 text-sm ring-2 ring-transparent focus:border-(--app-border-color-hover) focus:ring-(--app-focus-ring) focus:outline-none"
          :placeholder="t('quickAccess.customIconUrl')"
          name="icon"
          @input="iconSource = 'custom'"
        />
        <div class="text-app-secondary flex items-center gap-x-4 text-xs">
          <label class="flex cursor-pointer items-center gap-1.5">
            <input
              v-model="iconSource"
              type="radio"
              name="quick-link-icon-source"
              value="google"
              class="border-app bg-app-overlay h-3.5 w-3.5 cursor-pointer accent-current"
            />
            <span class="truncate">{{ t('quickAccess.iconFromGoogle') }}</span>
          </label>
          <label class="flex cursor-pointer items-center gap-1.5">
            <input
              v-model="iconSource"
              type="radio"
              name="quick-link-icon-source"
              value="unavatar"
              class="border-app bg-app-overlay h-3.5 w-3.5 cursor-pointer accent-current"
            />
            <span class="truncate">{{ t('quickAccess.iconFromUnavatar') }}</span>
          </label>
        </div>
      </div>

      <div class="flex flex-nowrap items-center justify-end gap-2 md:col-span-1">
        <button
          type="submit"
          class="border-app text-app bg-app-overlay bg-app-overlay-hover flex cursor-pointer items-center justify-center gap-1 rounded-lg border px-5 py-2 text-xs font-medium whitespace-nowrap transition disabled:opacity-60"
          :disabled="!formData.url.trim()"
        >
          {{ isEditing ? t('common.save') : t('common.add') }}
        </button>
        <button
          v-if="isEditing"
          type="button"
          class="border-app text-app bg-app-overlay bg-app-overlay-hover flex cursor-pointer items-center justify-center gap-1 rounded-lg border px-5 py-2 text-xs font-medium whitespace-nowrap transition disabled:opacity-60"
          @click="$emit('cancel')"
        >
          {{ t('common.cancel') }}
        </button>
      </div>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import { useI18n } from '@/i18n/composable'
import { normalizeURL } from '@/utils/search'
import { getGoogleFaviconUrl, getUnavatarFaviconUrl } from '@/utils/siteIcon'
import type { QuickLink } from '@/utils/types'
import { getTitleFromUrl } from '@/utils/url'

const { t } = useI18n()

const props = defineProps<{
  visible: boolean
  editingLink?: QuickLink | null
}>()

const emit = defineEmits<{
  submit: [data: { title: string; url: string; customFavicon?: string }]
  cancel: []
}>()

const formData = ref({ title: '', url: '', icon: '' })
const iconSource = ref<'google' | 'unavatar' | 'custom'>('custom')
const isEditing = ref(false)
const previewBroken = ref(false)

const previewSrc = computed(() => {
  if (previewBroken.value) return ''
  const s = formData.value.icon.trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s) || s.startsWith('chrome-extension:') || s.startsWith('data:')) return s
  return ''
})

const resetForm = () => {
  formData.value = { title: '', url: '', icon: '' }
  iconSource.value = 'custom'
  isEditing.value = false
  previewBroken.value = false
}

function detectIconSource(pageUrl: string, iconUrl: string): 'google' | 'unavatar' | 'custom' {
  const ctx = { url: pageUrl }
  const g = getGoogleFaviconUrl(ctx)
  const u = getUnavatarFaviconUrl(ctx)
  if (g && iconUrl === g) return 'google'
  if (u && iconUrl === u) return 'unavatar'
  return 'custom'
}

function applyIconFromSource() {
  if (iconSource.value === 'custom') return
  const raw = formData.value.url.trim()
  if (!raw) return
  try {
    const u = normalizeURL(raw)
    const ctx = { url: u }
    const next = iconSource.value === 'google' ? getGoogleFaviconUrl(ctx) : getUnavatarFaviconUrl(ctx)
    if (next) formData.value.icon = next
  } catch {
    /* ignore */
  }
}

const handleSubmit = () => {
  if (!formData.value.url.trim()) return

  const normalizedUrl = normalizeURL(formData.value.url.trim())
  const title = formData.value.title.trim() || getTitleFromUrl(normalizedUrl)
  const customFavicon = formData.value.icon.trim() || undefined

  emit('submit', { title, url: normalizedUrl, customFavicon })
}

watch(
  () => props.editingLink,
  link => {
    if (link) {
      const custom = link.customFavicon?.trim() || ''
      iconSource.value = custom ? detectIconSource(link.url, custom) : 'custom'
      formData.value = {
        title: link.title,
        url: link.url,
        icon: link.favicon || custom,
      }
      isEditing.value = true
    } else if (props.editingLink === null) {
      resetForm()
    }
  }
)

watch(
  () => props.visible,
  newVal => {
    if (!newVal) {
      resetForm()
    }
  }
)

watch(
  () => formData.value.icon,
  () => {
    previewBroken.value = false
  }
)

watch([() => formData.value.url, iconSource], () => {
  applyIconFromSource()
})
</script>
