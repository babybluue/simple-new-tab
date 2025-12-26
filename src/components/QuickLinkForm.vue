<template>
  <form
    v-if="visible"
    class="border-app bg-app-overlay mb-4 grid grid-cols-1 gap-3 rounded-2xl border p-4 shadow-(--app-shadow-sm) backdrop-blur-xl md:grid-cols-[1.1fr_1.5fr_1.2fr_auto] md:items-center md:gap-3 md:p-3"
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
      name="icon"
    />
    <div class="flex items-center gap-2">
      <button
        type="submit"
        class="h-10 cursor-pointer rounded-xl bg-(--primary-color) px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:h-9"
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
import { normalizeURL } from '@/utils/search'
import type { QuickLink } from '@/utils/types'
import { getTitleFromUrl } from '@/utils/url'

const { t } = useI18n()

const props = defineProps<{
  visible: boolean
  editingLink?: QuickLink | null
}>()

const emit = defineEmits<{
  submit: [data: { title: string; url: string; favicon?: string }]
  cancel: []
}>()

const formData = ref({ title: '', url: '', icon: '' })
const isEditing = ref(false)

const resetForm = () => {
  formData.value = { title: '', url: '', icon: '' }
  isEditing.value = false
}

const handleSubmit = () => {
  if (!formData.value.url.trim()) return

  const normalizedUrl = normalizeURL(formData.value.url.trim())
  const title = formData.value.title.trim() || getTitleFromUrl(normalizedUrl)
  const favicon = formData.value.icon.trim() || undefined

  emit('submit', { title, url: normalizedUrl, favicon })
}

watch(
  () => props.editingLink,
  link => {
    if (link) {
      formData.value = {
        title: link.title,
        url: link.url,
        icon: link.favicon || '',
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
