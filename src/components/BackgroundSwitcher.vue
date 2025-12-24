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
        class="w-[320px] overflow-hidden rounded-2xl border border-white/15 bg-white/12 p-4 text-white shadow-2xl ring-1 ring-white/20 backdrop-blur-2xl dark:border-white/20 dark:bg-[#1f2937]/95 dark:text-white/90"
      >
        <div class="text-base font-semibold">背景</div>

        <div class="mt-4 flex flex-wrap items-center gap-2">
          <button
            v-for="bg in PRESET_BACKGROUNDS"
            :key="bg"
            class="h-10 w-10 rounded-xl border border-white/30 shadow-sm transition hover:scale-[1.04] hover:shadow-lg focus:outline-none disabled:opacity-60"
            :class="{ 'ring-2 ring-white/80 ring-offset-2 ring-offset-white/10': isPresetActive(bg) }"
            :style="{ background: bg }"
            :disabled="applying"
            @click="usePreset(bg)"
          />
          <button
            class="relative h-10 w-10 overflow-hidden rounded-xl border border-white/30 bg-white/5 shadow-sm transition hover:scale-[1.04] hover:shadow-lg focus:outline-none disabled:opacity-60"
            :class="{ 'ring-2 ring-white/80 ring-offset-2 ring-offset-white/10': isPresetActive(customColor) }"
            @click="useCustom"
          >
            <input
              v-model="customColor"
              type="color"
              class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              title="自定义色"
              @input="useCustom"
            />
            <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
              <svg
                class="h-5 w-5 text-white/85 drop-shadow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 21v-3.5L14.5 6.9l3.6 3.6L6.6 21H3z" />
                <path d="M14 7l3 3" />
                <path d="M12.5 5.5l2-2a1.5 1.5 0 0 1 2.1 0l2.4 2.4a1.5 1.5 0 0 1 0 2.1l-2 2" />
              </svg>
            </div>
          </button>

          <button
            class="relative h-10 w-10 overflow-hidden rounded-xl border border-white/30 bg-white/5 shadow-sm transition hover:scale-[1.04] hover:shadow-lg focus:outline-none disabled:opacity-60"
            :class="{ 'ring-2 ring-white/80 ring-offset-2 ring-offset-white/10': settings.backgroundType === 'upload' }"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              title="上传图片"
              @click.stop
              @change="handleUpload"
            />
            <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
              <svg
                class="h-5 w-5 text-white/85 drop-shadow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 16v-6" />
                <path d="M9 13l3-3 3 3" />
                <path d="M4 17v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" />
                <path d="M16 7h2a2 2 0 0 1 2 2v3" />
                <path d="M4 12V9a2 2 0 0 1 2-2h2" />
              </svg>
            </div>
          </button>
        </div>

        <div
          class="mt-3 flex items-center justify-between rounded-xl bg-white/10 p-3 text-xs text-white/80 backdrop-blur-sm"
        >
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

import type { Settings } from '@/utils/storage'
import { DEFAULT_SETTINGS, getSettings, saveSettings } from '@/utils/storage'
import { applyBackground, fetchBingImageUrl } from '@/utils/theme'

const props = defineProps<{
  initialSettings?: Settings
}>()

const PRESET_BACKGROUNDS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #2563eb 45%, #0f172a 100%)',
  'linear-gradient(135deg, #34d399 0%, #10b981 45%, #047857 100%)',
  'linear-gradient(135deg, #fbbf24 0%, #f97316 45%, #ef4444 100%)',
  '#0b1224',
  'linear-gradient(135deg, #06b6d4 0%, #22d3ee 45%, #0ea5e9 100%)',
  'linear-gradient(135deg, #ef4444 0%, #dc2626 45%, #991b1b 100%)',
  'linear-gradient(135deg, #f472b6 0%, #ec4899 45%, #be185d 100%)',
  'linear-gradient(135deg, #9a3412 0%, #7c2d12 50%, #4a1d0f 100%)',
  'linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%)',
]

const normalizeColorInput = (value: string) =>
  value.startsWith('linear') || value.startsWith('radial') ? '#667eea' : value

const settings = ref<Settings>({ ...(props.initialSettings || DEFAULT_SETTINGS) })
const customColor = ref(normalizeColorInput(settings.value.backgroundColor))
const applying = ref(false)
const bingLoading = ref(false)
const open = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

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
    } else if (merged.backgroundType !== 'upload') {
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

const refreshBing = async () => {
  bingLoading.value = true
  await persistAndApply({ backgroundType: 'bing', backgroundImageUrl: '' }, true)
}

const isPresetActive = (value: string) =>
  settings.value.backgroundType !== 'bing' &&
  settings.value.backgroundType !== 'upload' &&
  settings.value.backgroundColor === value

const handleUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async e => {
    const result = e.target?.result
    if (typeof result === 'string') {
      await persistAndApply({ backgroundType: 'upload', backgroundImageUrl: result })
    }
  }
  reader.readAsDataURL(file)
  // 允许选择同一文件时也能再次触发 change
  target.value = ''
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
