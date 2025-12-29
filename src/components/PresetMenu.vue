<template>
  <Teleport to="body">
    <div
      v-if="open"
      data-quick-access-preset
      class="border-app menu-app fixed z-50 w-72 overflow-hidden rounded-lg border shadow-(--app-shadow-md) backdrop-blur-sm"
      :style="{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: `${position.maxHeight}px`,
      }"
    >
      <div class="text-app-tertiary flex items-center justify-between px-3 py-2 text-[11px]">
        <span>{{ t('presetMenu.selectCommonSites') }}</span>
        <span>{{ hasAvailablePresets ? t('presetMenu.clickToAdd') : t('presetMenu.allAdded') }}</span>
      </div>
      <div class="px-3 pb-2">
        <input
          v-model="searchQuery"
          type="search"
          autocomplete="off"
          class="border-app bg-app-overlay text-app placeholder:text-app-tertiary h-8 w-full rounded-md border px-2 text-xs ring-2 ring-transparent outline-none focus:border-(--app-border-color-hover) focus:ring-(--app-focus-ring)"
          :placeholder="t('presetMenu.searchOrFilter')"
        />
      </div>
      <div class="overflow-auto p-1" :style="{ maxHeight: `${Math.max(position.maxHeight - 92, 160)}px` }">
        <button
          v-for="preset in filteredPresets"
          :key="preset.url"
          type="button"
          class="menu-item-app group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="preset.added"
          @click.stop="$emit('select', preset)"
        >
          <img
            v-if="preset.logo || preset.favicon"
            :src="preset.logo || preset.favicon"
            :alt="preset.title"
            class="h-5 w-5 rounded transition group-hover:scale-105"
          />
          <div class="min-w-0 flex-1 text-left">
            <div class="flex items-center gap-2">
              <span class="truncate">{{ getLocalizedSiteTitle(preset.url, getLocale(), preset.title) }}</span>
              <span v-if="preset.added" class="text-app-tertiary text-[11px]">{{ t('presetMenu.added') }}</span>
            </div>
            <p class="text-app-tertiary truncate text-[11px]">{{ preset.domain }}</p>
          </div>
          <span
            v-if="!preset.added"
            class="badge-primary cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-medium"
          >
            {{ t('presetMenu.add') }}
          </span>
        </button>
        <div v-if="!filteredPresets.length" class="text-app-tertiary px-3 py-6 text-center text-[12px]">
          {{ t('presetMenu.noMatches') }}
        </div>
      </div>
      <div v-if="!hasAvailablePresets" class="text-app-tertiary px-3 pb-3 text-[11px]">
        {{ t('presetMenu.allSitesAdded') }}
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

import { getLocale } from '@/i18n'
import { useI18n } from '@/i18n/composable'
import { getLocalizedSiteTitle } from '@/utils/presets'
import type { QuickLink } from '@/utils/types'

const { t } = useI18n()

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
  const currentLocale = getLocale()
  if (!keyword) return props.presets
  return props.presets.filter(preset => {
    const localizedTitle = getLocalizedSiteTitle(preset.url, currentLocale, preset.title)
    const title = localizedTitle.toLowerCase()
    const domain = (preset.domain || '').toLowerCase()
    return title.includes(keyword) || domain.includes(keyword)
  })
})

watch(
  () => props.open,
  newVal => {
    if (newVal) {
      searchQuery.value = ''
    }
  }
)
</script>
