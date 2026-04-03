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
          class="border-app bg-app-overlay text-app-secondary relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-xs font-medium"
        >
          <img
            v-if="previewSrc"
            :key="previewSrc"
            :src="previewSrc"
            alt=""
            class="h-full w-full object-contain p-1 transition-opacity"
            :class="{ 'opacity-0': previewImageLoading }"
            @load="onPreviewLoad"
            @error="onPreviewError"
          />
          <div
            v-if="previewImageLoading"
            class="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <LoadingSpinnerIcon size="h-4 w-4" />
          </div>
          <span v-if="!previewSrc && !previewImageLoading" class="px-0.5 text-center leading-none">—</span>
        </div>
        <input
          v-model="formData.title"
          type="text"
          class="border-app bg-app-overlay text-app placeholder:text-app-tertiary w-full rounded-xl border px-3 py-2 text-sm ring-2 ring-transparent focus:border-(--app-border-color-hover) focus:ring-(--app-focus-ring) focus:outline-none"
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
      <div class="flex flex-2 gap-2">
        <input
          v-model="formData.icon"
          type="text"
          class="border-app bg-app-overlay text-app placeholder:text-app-tertiary w-full min-w-[100px] rounded-xl border px-3 py-2 text-sm ring-2 ring-transparent focus:border-(--app-border-color-hover) focus:ring-(--app-focus-ring) focus:outline-none"
          :placeholder="t('quickAccess.customIconUrl')"
          name="icon"
          @input="onCustomIconInput"
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
import { getGoogleFaviconUrl, getUnavatarFaviconUrl, resolveLinkIcon } from '@/utils/siteIcon'
import type { QuickLink } from '@/utils/types'
import { getTitleFromUrl } from '@/utils/url'

import LoadingSpinnerIcon from './LoadingSpinnerIcon.vue'

const { t } = useI18n()

const props = defineProps<{
  visible: boolean
  editingLink?: QuickLink | null
}>()

const emit = defineEmits<{
  /** customFavicon 可为空字符串，表示清除自定义图标（走预设 / Chrome 缓存） */
  submit: [data: { title: string; url: string; customFavicon: string }]
  cancel: []
}>()

const formData = ref({ title: '', url: '', icon: '' })
const iconSource = ref<'google' | 'unavatar' | 'custom'>('custom')
const isEditing = ref(false)
const previewBroken = ref(false)
const previewImageLoading = ref(false)

function onCustomIconInput() {
  if (iconSource.value === 'google' || iconSource.value === 'unavatar') {
    iconSource.value = 'custom'
  }
}

function onPreviewLoad() {
  previewBroken.value = false
  previewImageLoading.value = false
}

function onPreviewError() {
  previewBroken.value = true
  previewImageLoading.value = false
}

const normalizedFormUrl = computed(() => {
  const raw = formData.value.url.trim()
  if (!raw) return ''
  try {
    return normalizeURL(raw)
  } catch {
    return ''
  }
})

/** 用户在「自定义图标」输入框中的 URL（可预览） */
const typedIconPreviewUrl = computed(() => {
  const s = formData.value.icon.trim()
  if (!s) return ''
  if (/^https?:\/\//i.test(s) || s.startsWith('chrome-extension:') || s.startsWith('data:')) return s
  return ''
})

/** 与列表/卡片一致的解析：有自定义用自定义，否则预设 > Chrome 缓存 */
const previewSrc = computed(() => {
  if (previewBroken.value) return ''
  const typed = typedIconPreviewUrl.value
  if (typed) return typed
  const u = normalizedFormUrl.value
  if (!u) return ''
  const { icon } = resolveLinkIcon({ url: u, customFavicon: undefined })
  return icon || ''
})

const resetForm = () => {
  formData.value = { title: '', url: '', icon: '' }
  iconSource.value = 'custom'
  isEditing.value = false
  previewBroken.value = false
  previewImageLoading.value = false
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
  const customFavicon = formData.value.icon.trim()

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
        icon: custom,
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
  icon => {
    previewBroken.value = false
    const t = icon.trim()
    if (!t && (iconSource.value === 'google' || iconSource.value === 'unavatar')) {
      iconSource.value = 'custom'
    }
  }
)

watch([() => formData.value.url, iconSource], () => {
  applyIconFromSource()
})

watch(
  [previewSrc, iconSource, typedIconPreviewUrl],
  () => {
    if (!previewSrc.value) {
      previewImageLoading.value = false
      return
    }
    const fromService = iconSource.value === 'google' || iconSource.value === 'unavatar'
    const fromCustomInput = Boolean(typedIconPreviewUrl.value)
    previewImageLoading.value = fromService || fromCustomInput
  },
  { flush: 'sync' }
)
</script>
