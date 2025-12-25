<template>
  <form
    v-if="visible"
    class="mb-4 grid grid-cols-1 gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-xl md:grid-cols-[1.1fr_1.5fr_1.2fr_auto] md:items-center md:gap-3 md:p-3 dark:border-white/30 dark:bg-white/85"
    aria-label="添加快速访问"
    @submit.prevent="handleSubmit"
  >
    <input
      v-model="formData.title"
      type="text"
      class="w-full rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-sm text-[#1f2937] placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none dark:border-white/40 dark:bg-white/95"
      placeholder="网站名称（可选）"
      name="title"
    />
    <input
      v-model="formData.url"
      type="text"
      class="w-full rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-sm text-[#1f2937] placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none dark:border-white/40 dark:bg-white/95"
      placeholder="网站链接，例如 https://example.com"
      required
      name="url"
    />
    <input
      v-model="formData.icon"
      type="text"
      class="w-full rounded-xl border border-white/20 bg-white/70 px-3 py-2 text-sm text-[#1f2937] placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none dark:border-white/40 dark:bg-white/95"
      placeholder="自定义图标 URL（可选）"
      name="icon"
    />
    <div class="flex items-center gap-2">
      <button
        type="submit"
        class="h-10 cursor-pointer rounded-xl bg-indigo-500 px-4 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300 md:h-9"
        :disabled="!formData.url.trim()"
      >
        {{ isEditing ? '保存' : '添加' }}
      </button>
      <button
        v-if="isEditing"
        type="button"
        class="h-10 cursor-pointer rounded-xl border border-white/30 bg-transparent px-4 text-sm font-medium text-white/80 transition hover:border-white/50 hover:text-white md:h-9 dark:border-[#213547]/40 dark:text-[#213547]/80 dark:hover:border-[#213547]/60 dark:hover:text-[#213547]"
        @click="$emit('cancel')"
      >
        取消
      </button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

import type { QuickLink } from '@/utils/types'
import { normalizeURL } from '@/utils/search'
import { extractDomainFromUrl, getTitleFromUrl } from '@/utils/url'

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

