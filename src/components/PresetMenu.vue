<template>
  <Teleport to="body">
    <div
      v-if="open"
      data-quick-access-preset
      class="fixed z-50 w-72 overflow-hidden rounded-lg border border-white/15 bg-white/95 shadow-xl backdrop-blur-sm dark:border-[#213547]/25 dark:bg-[#f6f7fb]"
      :style="{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: `${position.maxHeight}px`,
      }"
    >
      <div class="flex items-center justify-between px-3 py-2 text-[11px] text-gray-500">
        <span>选择常用网站</span>
        <span>{{ hasAvailablePresets ? '点击即可添加' : '已全部添加' }}</span>
      </div>
      <div class="px-3 pb-2">
        <input
          v-model="searchQuery"
          type="search"
          autocomplete="off"
          class="h-8 w-full rounded-md border border-black/5 bg-white/80 px-2 text-xs text-[#1f2937] outline-none placeholder:text-gray-400 focus:border-indigo-300 focus:ring-0 dark:border-[#213547]/20 dark:bg-white"
          placeholder="搜索或输入关键词筛选"
        />
      </div>
      <div class="overflow-auto p-1" :style="{ maxHeight: `${Math.max(position.maxHeight - 92, 160)}px` }">
        <button
          v-for="preset in filteredPresets"
          :key="preset.url"
          type="button"
          class="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[#1f2937] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="preset.added"
          @click.stop="$emit('select', preset)"
        >
          <img
            v-if="preset.favicon"
            :src="preset.favicon"
            :alt="preset.title"
            class="h-5 w-5 rounded transition group-hover:scale-105"
          />
          <div class="min-w-0 flex-1 text-left">
            <div class="flex items-center gap-2">
              <span class="truncate">{{ preset.title }}</span>
              <span v-if="preset.added" class="text-[11px] text-gray-400">已添加</span>
            </div>
            <p class="truncate text-[11px] text-gray-500">{{ preset.domain }}</p>
          </div>
          <span v-if="!preset.added" class="text-[11px] text-indigo-500">添加</span>
        </button>
        <div v-if="!filteredPresets.length" class="px-3 py-6 text-center text-[12px] text-gray-500">
          未找到匹配的站点
        </div>
      </div>
      <div v-if="!hasAvailablePresets" class="px-3 pb-3 text-[11px] text-gray-500">常用网站已全部添加</div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import type { QuickLink } from '@/utils/types'

export interface PresetOption extends QuickLink {
  added?: boolean
}

const props = defineProps<{
  open: boolean
  presets: PresetOption[]
  position: { top: number; left: number; maxHeight: number }
}>()

defineEmits<{
  select: [preset: PresetOption]
}>()

const searchQuery = ref('')

const hasAvailablePresets = computed(() => props.presets.some(preset => !preset.added))

const filteredPresets = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase()
  if (!keyword) return props.presets
  return props.presets.filter(preset => {
    const title = preset.title.toLowerCase()
    const domain = (preset.domain || '').toLowerCase()
    return title.includes(keyword) || domain.includes(keyword)
  })
})

watch(() => props.open, newVal => {
  if (newVal) {
    searchQuery.value = ''
  }
})
</script>

