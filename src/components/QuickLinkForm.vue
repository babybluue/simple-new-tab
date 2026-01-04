<template>
  <form
    v-if="visible"
    class="border-app bg-app-overlay mb-4 grid grid-cols-1 gap-3 rounded-2xl border p-4 shadow-(--app-shadow-sm) backdrop-blur-xl md:grid-cols-[1.1fr_1.5fr_1fr_auto_auto] md:items-center md:gap-3 md:p-3"
    :aria-label="t('quickAccess.addCustom')"
    @submit.prevent="handleSubmit"
  >
    <input
      v-model="formData.title"
      type="text"
      class="border-app bg-app-overlay text-app placeholder:text-app-tertiary w-full rounded-xl border px-3 py-2 text-sm ring-2 ring-transparent focus:border-(--app-border-color-hover) focus:ring-(--app-focus-ring) focus:outline-none"
      :placeholder="t('quickAccess.websiteName')"
      name="title"
    />
    <input
      v-model="formData.url"
      type="text"
      class="border-app bg-app-overlay text-app placeholder:text-app-tertiary w-full rounded-xl border px-3 py-2 text-sm ring-2 ring-transparent focus:border-(--app-border-color-hover) focus:ring-(--app-focus-ring) focus:outline-none"
      :placeholder="t('quickAccess.websiteUrl')"
      required
      name="url"
    />
    <input
      v-model="formData.icon"
      type="text"
      class="border-app bg-app-overlay text-app placeholder:text-app-tertiary w-full rounded-xl border px-3 py-2 text-sm ring-2 ring-transparent focus:border-(--app-border-color-hover) focus:ring-(--app-focus-ring) focus:outline-none"
      :placeholder="t('quickAccess.customIconUrl')"
      :disabled="formData.useLocalFavicon"
      name="icon"
    />
    <label
      class="text-app-secondary flex cursor-pointer items-center gap-2 text-sm whitespace-nowrap"
      :title="t('quickAccess.useLocalFaviconTip')"
    >
      <input
        v-model="formData.useLocalFavicon"
        type="checkbox"
        class="border-app bg-app-overlay h-4 w-4 cursor-pointer rounded border accent-current"
      />
      <span>{{ t('quickAccess.useLocalFavicon') }}</span>
    </label>
    <div class="flex items-center gap-2">
      <button
        type="submit"
        class="border-app h-10 cursor-pointer rounded-xl border px-4 text-sm font-semibold shadow-(--app-shadow-xs) transition hover:opacity-90 focus:ring-(--app-focus-ring) focus:outline-none active:opacity-85 disabled:cursor-not-allowed disabled:opacity-60 md:h-9"
        :style="getPrimaryActionStyle()"
        :disabled="!formData.url.trim()"
      >
        {{ isEditing ? t('common.save') : t('common.add') }}
      </button>
      <button
        v-if="isEditing"
        type="button"
        class="border-app text-app-secondary hover:text-app bg-app-overlay-hover h-10 cursor-pointer rounded-xl border bg-transparent px-4 text-sm font-medium transition md:h-9"
        @click="$emit('cancel')"
      >
        {{ t('common.cancel') }}
      </button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

import { useI18n } from '@/i18n/composable'
import { getFavicon, isAutoFavicon } from '@/utils/favicon'
import { normalizeURL } from '@/utils/search'
import type { QuickLink } from '@/utils/types'
import { getTitleFromUrl } from '@/utils/url'

const { t } = useI18n()

const props = defineProps<{
  visible: boolean
  editingLink?: QuickLink | null
}>()

const emit = defineEmits<{
  submit: [data: { title: string; url: string; favicon?: string; useLocalFavicon?: boolean }]
  cancel: []
}>()

const formData = ref({ title: '', url: '', icon: '', useLocalFavicon: false })
const isEditing = ref(false)

const getPrimaryActionStyle = () => {
  // 与 Settings.vue 的 switch 的“开关强调点”(thumb) 一致：使用 --app-text-color
  // 文字用 --app-bg-overlay 做反色，保证 dark/light 都清晰可读
  return {
    backgroundColor: 'var(--app-text-color)',
    color: 'var(--app-bg-overlay)',
    borderColor: 'color-mix(in srgb, var(--app-text-color) 55%, var(--app-border-color-hover))',
  } as const
}

const resetForm = () => {
  formData.value = { title: '', url: '', icon: '', useLocalFavicon: false }
  isEditing.value = false
}

const handleSubmit = () => {
  if (!formData.value.url.trim()) return

  const normalizedUrl = normalizeURL(formData.value.url.trim())
  const title = formData.value.title.trim() || getTitleFromUrl(normalizedUrl)
  // 如果使用本地 favicon，清除自定义图标 URL
  const favicon = formData.value.useLocalFavicon ? undefined : formData.value.icon.trim() || undefined
  const useLocalFavicon = formData.value.useLocalFavicon || undefined

  emit('submit', { title, url: normalizedUrl, favicon, useLocalFavicon })
}

watch(
  () => props.editingLink,
  link => {
    if (link) {
      const item = { domain: link.domain, url: link.url }
      const shouldShowCustomIcon = !!(link.favicon && !isAutoFavicon(item, link.favicon))
      // 如果有本地 logo 或者明确设置了 useLocalFavicon，都视为使用本地图标
      const useLocalFavicon = link.useLocalFavicon || !!link.logo
      // 如果使用本地图标，图标 URL 为空（除非用户有自定义图标）
      const iconValue = useLocalFavicon
        ? shouldShowCustomIcon
          ? link.favicon || ''
          : ''
        : link.favicon || getFavicon(item)
      formData.value = {
        title: link.title,
        url: link.url,
        // 有本地 logo：仅回填"用户显式填写"的自定义图标 URL（不回填自动在线 favicon）
        // 无本地 logo：回填在线 favicon URL（符合"在线获取"的初衷，也方便用户改成自定义 URL）
        icon: iconValue,
        useLocalFavicon,
      }
      isEditing.value = true
    } else if (props.editingLink === null) {
      // 只有在明确设置为 null 时才重置（避免初始化时的误触发）
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
</script>
