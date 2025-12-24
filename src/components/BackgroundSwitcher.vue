<template>
  <div class="fixed top-6 right-6 z-50 flex flex-col items-end gap-3 md:right-5">
    <button
      class="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white/90 shadow-lg backdrop-blur-lg transition-all duration-300 hover:scale-110 hover:rotate-90 hover:bg-white/25 hover:text-white hover:shadow-xl dark:border-white/30 dark:bg-white/85 dark:text-[#213547]/80 dark:hover:bg-white/95 dark:hover:text-[#213547]/95"
      title="设置"
      @click="toggle"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <Transition name="fade">
      <div
        v-if="open"
        class="w-[320px] overflow-hidden rounded-2xl border border-white/15 bg-white/12 p-4 text-white shadow-2xl backdrop-blur-2xl ring-1 ring-white/20 dark:border-white/20 dark:bg-[#1f2937]/95 dark:text-white/90"
      >
        <div class="flex items-center justify-between">
          <div class="text-base font-semibold">背景</div>
          <button
            class="flex h-9 items-center gap-2 rounded-xl bg-white/20 px-3 text-xs font-medium text-white transition hover:bg-white/30 disabled:opacity-60"
            :disabled="bingLoading || applying"
            @click="useBing"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h5l2 3h6a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"
              />
            </svg>
            Bing 壁纸
          </button>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="bg in PRESET_BACKGROUNDS"
            :key="bg"
            class="h-10 w-10 rounded-xl border border-white/30 shadow-sm transition hover:scale-[1.04] hover:shadow-lg focus:outline-none disabled:opacity-60"
            :class="{ 'ring-2 ring-white/80 ring-offset-2 ring-offset-white/10': isPresetActive(bg) }"
            :style="{ background: bg }"
            :disabled="applying"
            @click="usePreset(bg)"
          />
        </div>

        <div class="mt-4 flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-sm">
          <input
            v-model="customColor"
            type="color"
            class="h-11 w-14 cursor-pointer rounded-lg border border-white/25 bg-transparent p-0 outline-none"
            @input="useCustom"
          />
          <div class="min-w-[140px] flex-1 text-xs text-white/80">自定义色，立即生效</div>
          <button
            class="rounded-lg bg-white/25 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/35 disabled:opacity-60"
            :disabled="applying"
            @click="useCustom"
          >
            应用
          </button>
        </div>

        <div class="mt-3 flex items-center justify-between rounded-xl bg-white/10 p-3 text-xs text-white/80 backdrop-blur-sm">
          <span>刷新 Bing 壁纸</span>
          <button
            class="flex items-center gap-1 rounded-lg border border-white/25 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
            :disabled="bingLoading || applying"
            @click="refreshBing"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v6h6M20 20v-6h-6M5 19A9 9 0 0118 6l1-1M19 5l-1 1"
              />
            </svg>
            刷新
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import { applyBackground, fetchBingImageUrl } from '@/utils/theme'
import { DEFAULT_SETTINGS, getSettings, saveSettings } from '@/utils/storage'
import type { Settings } from '@/utils/storage'

const props = defineProps<{
  initialSettings?: Settings
}>()

const PRESET_BACKGROUNDS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #2563eb 45%, #0f172a 100%)',
  '#e2e8f0',
  'linear-gradient(135deg, #34d399 0%, #10b981 45%, #047857 100%)',
  'linear-gradient(135deg, #fbbf24 0%, #f97316 45%, #ef4444 100%)',
  '#0b1224',
]

const normalizeColorInput = (value: string) =>
  value.startsWith('linear') || value.startsWith('radial') ? '#667eea' : value

const settings = ref<Settings>({ ...(props.initialSettings || DEFAULT_SETTINGS) })
const customColor = ref(normalizeColorInput(settings.value.backgroundColor))
const applying = ref(false)
const bingLoading = ref(false)
const open = ref(false)

const ensureSettings = async () => {
  if (props.initialSettings) return
  const stored = await getSettings()
  settings.value = stored
  customColor.value = normalizeColorInput(stored.backgroundColor)
  await applyBackground(stored)
}

onMounted(async () => {
  await ensureSettings()
})

const toggle = () => {
  open.value = !open.value
}

const persistAndApply = async (next: Partial<Settings>, forceRefreshBing = false) => {
  applying.value = true
  try {
    const merged: Settings = { ...settings.value, ...next }

    if (merged.backgroundType === 'bing') {
      if (forceRefreshBing || !merged.backgroundImageUrl) {
        const url = await fetchBingImageUrl(merged.backgroundImageUrl)
        if (url) {
          merged.backgroundImageUrl = url
        }
      }
    } else {
      merged.backgroundImageUrl = ''
    }

    settings.value = merged
    const fetched = await applyBackground(merged)
    if (fetched) {
      settings.value.backgroundImageUrl = fetched
    }
    await saveSettings(settings.value)
  } finally {
    applying.value = false
    bingLoading.value = false
  }
}

const usePreset = async (value: string) => {
  await persistAndApply({ backgroundType: 'preset', backgroundColor: value })
}

const useCustom = async () => {
  await persistAndApply({ backgroundType: 'custom', backgroundColor: customColor.value })
}

const useBing = async () => {
  bingLoading.value = true
  await persistAndApply({ backgroundType: 'bing' }, true)
}

const refreshBing = async () => {
  bingLoading.value = true
  await persistAndApply({ backgroundType: 'bing', backgroundImageUrl: '' }, true)
}

const isPresetActive = (value: string) =>
  settings.value.backgroundType !== 'bing' && settings.value.backgroundColor === value
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>

