<template>
  <aside class="fixed top-6 right-6 z-50 flex flex-col items-end gap-3 md:right-5" :aria-label="tFn('settings.title')">
    <button
      class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border shadow-(--app-shadow-sm) backdrop-blur-lg transition-all duration-300 hover:scale-[1.06] hover:rotate-45 hover:shadow-(--app-shadow-md)"
      :title="tFn('common.settings')"
      type="button"
      :aria-expanded="open"
      aria-controls="settings-panel"
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
      <section
        v-if="open"
        id="settings-panel"
        class="border-app bg-app-overlay text-app-secondary ring-app-border max-h-[calc(100vh-8rem)] w-[330px] overflow-y-auto rounded-2xl border p-4 shadow-(--app-shadow-lg) ring-1 backdrop-blur-2xl"
        style="--tw-ring-color: var(--app-border-color)"
        :aria-label="tFn('settings.title')"
      >
        <div>
          <div class="mb-4 text-base font-semibold">{{ tFn('settings.language') }}</div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="langOption in LANGUAGE_OPTIONS"
              :key="langOption.value"
              class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm transition focus:outline-none disabled:opacity-60"
              :class="{
                'ring-2 ring-offset-2': currentLanguage === langOption.value,
              }"
              :style="
                currentLanguage === langOption.value
                  ? {
                      '--tw-ring-color': 'var(--app-border-color-hover)',
                      '--tw-ring-offset-color': 'var(--app-bg-overlay)',
                    }
                  : {}
              "
              type="button"
              :disabled="applying"
              @click="useLanguage(langOption.value)"
            >
              <span>{{ langOption.label }}</span>
            </button>
          </div>
        </div>

        <div class="mt-4">
          <div class="mb-4 text-base font-semibold">{{ tFn('settings.theme') }}</div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="themeOption in THEME_OPTIONS"
              :key="themeOption.value"
              class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm transition focus:outline-none disabled:opacity-60"
              :class="{
                'ring-2 ring-offset-2': settings.theme === themeOption.value,
              }"
              :style="
                settings.theme === themeOption.value
                  ? {
                      '--tw-ring-color': 'var(--app-border-color-hover)',
                      '--tw-ring-offset-color': 'var(--app-bg-overlay)',
                    }
                  : {}
              "
              type="button"
              :disabled="applying"
              @click="useTheme(themeOption.value)"
            >
              <span>{{ themeOption.label }}</span>
            </button>
          </div>
        </div>
        <div class="mt-4">
          <div class="text-base font-semibold">{{ tFn('settings.background') }}</div>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <button
              v-for="bg in PRESET_BACKGROUNDS"
              :key="bg"
              class="border-app h-10 w-10 cursor-pointer rounded-xl border shadow-(--app-shadow-xs) transition hover:scale-[1.04] hover:shadow-(--app-shadow-sm) focus:outline-none disabled:opacity-60"
              :class="{ 'ring-2': isPresetActive(bg) }"
              :style="{
                background: bg,
                ...(isPresetActive(bg)
                  ? {
                      '--tw-ring-color': 'var(--app-border-color-hover)',
                      '--tw-ring-offset-color': 'var(--app-bg-overlay)',
                    }
                  : {}),
              }"
              type="button"
              :disabled="applying"
              @click="usePreset(bg)"
            />
            <button
              class="border-app bg-app-overlay relative h-10 w-10 cursor-pointer overflow-hidden rounded-xl border shadow-(--app-shadow-xs) transition hover:scale-[1.04] hover:shadow-(--app-shadow-sm) focus:outline-none disabled:opacity-60"
              :class="{ 'ring-2': isCustomActive() }"
              :style="
                isCustomActive()
                  ? {
                      '--tw-ring-color': 'var(--app-border-color-hover)',
                      '--tw-ring-offset-color': 'var(--app-bg-overlay)',
                    }
                  : {}
              "
              type="button"
            >
              <input
                v-model="customColor"
                type="color"
                class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                :title="tFn('settings.customColor')"
                @input="handleCustomColorInput"
              />
              <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
                <svg
                  class="text-app-secondary h-5 w-5 drop-shadow"
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
          </div>

          <div
            class="border-app bg-app-overlay text-app-secondary mt-3 flex items-center justify-between rounded-xl border p-3 text-xs shadow-(--app-shadow-xs) backdrop-blur-sm"
          >
            <span>{{ tFn('settings.refreshBingWallpaper') }}</span>
            <button
              class="border-app text-app bg-app-overlay bg-app-overlay-hover flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-60"
              type="button"
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
              {{ tFn('common.refresh') }}
            </button>
          </div>

          <div
            class="border-app bg-app-overlay text-app-secondary mt-3 flex items-center justify-between rounded-xl border p-3 text-xs shadow-(--app-shadow-xs) backdrop-blur-sm"
          >
            <span>{{ tFn('settings.uploadImage') }}</span>
            <button
              class="border-app text-app bg-app-overlay bg-app-overlay-hover relative flex cursor-pointer items-center gap-1 overflow-hidden rounded-lg border px-3 py-2 text-xs font-medium transition disabled:opacity-60"
              type="button"
              :disabled="applying"
              :title="tFn('settings.uploadImage')"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                @click.stop
                @change="handleUpload"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16v-6" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13l3-3 3 3" />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 17v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"
                />
              </svg>
              {{ tFn('common.upload') }}
            </button>
          </div>
        </div>

        <div class="mt-4">
          <div class="mb-4 text-base font-semibold">{{ tFn('settings.primaryColor') }}</div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="color in PRIMARY_PRESETS"
              :key="color"
              class="border-app h-10 w-10 cursor-pointer rounded-xl border shadow-(--app-shadow-xs) transition hover:scale-[1.04] hover:shadow-(--app-shadow-sm) focus:outline-none disabled:opacity-60"
              :class="{ 'ring-2': isPrimaryActive(color) }"
              :style="{
                background: color,
                ...(isPrimaryActive(color)
                  ? {
                      '--tw-ring-color': 'var(--app-border-color-hover)',
                      '--tw-ring-offset-color': 'var(--app-bg-overlay)',
                    }
                  : {}),
              }"
              type="button"
              :disabled="applying"
              @click="usePrimaryPreset(color)"
            />
            <button
              class="border-app bg-app-overlay relative h-10 w-10 cursor-pointer overflow-hidden rounded-xl border shadow-(--app-shadow-xs) transition hover:scale-[1.04] hover:shadow-(--app-shadow-sm) focus:outline-none disabled:opacity-60"
              :class="{ 'ring-2': isPrimaryCustomActive() }"
              :style="
                isPrimaryCustomActive()
                  ? {
                      '--tw-ring-color': 'var(--app-border-color-hover)',
                      '--tw-ring-offset-color': 'var(--app-bg-overlay)',
                    }
                  : {}
              "
              type="button"
              @click="usePrimaryCustom"
            >
              <input
                v-model="primaryCustomColor"
                type="color"
                class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                :title="tFn('settings.primaryColorCustom')"
                @input="usePrimaryCustom"
              />
              <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
                <svg
                  class="text-app-secondary h-5 w-5 drop-shadow"
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
          </div>
        </div>

        <div class="mt-4">
          <div class="mb-4 text-base font-semibold">{{ tFn('settings.controls') }}</div>
          <div class="space-y-3">
            <label
              class="border-app bg-app-overlay text-app-secondary bg-app-overlay-hover flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm shadow-(--app-shadow-xs) backdrop-blur-sm transition"
            >
              <span>{{ tFn('settings.dateTime') }}</span>
              <button
                type="button"
                role="switch"
                :aria-checked="settings.showDateTime"
                class="border-app relative h-6 w-11 cursor-pointer rounded-full border shadow-(--app-shadow-xs) ring-2 ring-transparent transition-colors focus:ring-(--app-focus-ring) focus:outline-none disabled:opacity-60"
                :style="getSwitchTrackStyle(settings.showDateTime)"
                :disabled="applying"
                @click="toggleVisibility('showDateTime')"
              >
                <span
                  class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow-(--app-shadow-xs) transition-transform"
                  style="background-color: var(--app-text-color)"
                  :class="settings.showDateTime ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </label>
            <label
              class="border-app bg-app-overlay text-app-secondary bg-app-overlay-hover flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm shadow-(--app-shadow-xs) backdrop-blur-sm transition"
            >
              <span>{{ tFn('settings.quickAccess') }}</span>
              <button
                type="button"
                role="switch"
                :aria-checked="settings.showQuickAccess"
                class="border-app relative h-6 w-11 cursor-pointer rounded-full border shadow-(--app-shadow-xs) ring-2 ring-transparent transition-colors focus:ring-(--app-focus-ring) focus:outline-none disabled:opacity-60"
                :style="getSwitchTrackStyle(settings.showQuickAccess)"
                :disabled="applying"
                @click="toggleVisibility('showQuickAccess')"
              >
                <span
                  class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow-(--app-shadow-xs) transition-transform"
                  style="background-color: var(--app-text-color)"
                  :class="settings.showQuickAccess ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </label>
            <label
              class="border-app bg-app-overlay text-app-secondary bg-app-overlay-hover flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm shadow-(--app-shadow-xs) backdrop-blur-sm transition"
            >
              <span>{{ tFn('settings.recentVisits') }}</span>
              <button
                type="button"
                role="switch"
                :aria-checked="settings.showHistory"
                class="border-app relative h-6 w-11 cursor-pointer rounded-full border shadow-(--app-shadow-xs) ring-2 ring-transparent transition-colors focus:ring-(--app-focus-ring) focus:outline-none disabled:opacity-60"
                :style="getSwitchTrackStyle(settings.showHistory)"
                :disabled="applying"
                @click="toggleVisibility('showHistory')"
              >
                <span
                  class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow-(--app-shadow-xs) transition-transform"
                  style="background-color: var(--app-text-color)"
                  :class="settings.showHistory ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </label>
            <label
              class="border-app bg-app-overlay text-app-secondary bg-app-overlay-hover flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm shadow-(--app-shadow-xs) backdrop-blur-sm transition"
            >
              <span>{{ tFn('settings.iconOnlyLinkCards') }}</span>
              <button
                type="button"
                role="switch"
                :aria-checked="settings.iconOnlyLinkCards"
                class="border-app relative h-6 w-11 cursor-pointer rounded-full border shadow-(--app-shadow-xs) ring-2 ring-transparent transition-colors focus:ring-(--app-focus-ring) focus:outline-none disabled:opacity-60"
                :style="getSwitchTrackStyle(settings.iconOnlyLinkCards)"
                :disabled="applying"
                @click="toggleVisibility('iconOnlyLinkCards')"
              >
                <span
                  class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow-(--app-shadow-xs) transition-transform"
                  style="background-color: var(--app-text-color)"
                  :class="settings.iconOnlyLinkCards ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </label>
          </div>
        </div>
      </section>
    </Transition>
  </aside>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'

import type { SupportedLocale } from '@/i18n'
import { getLocale, setLocale, t } from '@/i18n'
import { useI18n } from '@/i18n/composable'
import type { Settings } from '@/utils/storage'
import { DEFAULT_SETTINGS, getSettings, saveSettings } from '@/utils/storage'
import {
  applyBackground,
  applyPrimaryColor,
  applyTheme,
  clearBingImageCache,
  fetchBingImageUrl,
  THEME_DARK_BG,
  THEME_LIGHT_BG,
} from '@/utils/theme'

const { t: tFn } = useI18n()

const props = defineProps<{
  initialSettings?: Settings
}>()

const emit = defineEmits<{
  'settings-updated': [settings: Settings]
}>()

// 使用从 theme.ts 导入的常量

const PRESET_BACKGROUNDS = [
  THEME_LIGHT_BG,
  THEME_DARK_BG,
  'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #2563eb 45%, #0f172a 100%)',
  'linear-gradient(135deg, #34d399 0%, #10b981 45%, #047857 100%)',
  'linear-gradient(135deg, #fbbf24 0%, #f97316 45%, #ef4444 100%)',
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
const primaryCustomColor = ref(settings.value.primaryColor || '#667eea')
const applying = ref(false)
const bingLoading = ref(false)
const open = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const PRIMARY_PRESETS = [
  THEME_LIGHT_BG,
  THEME_DARK_BG,
  '#6200ea', // Deep Purple 500
  '#2962ff', // Blue A700
  '#00c853', // Green A700
  '#ff9800', // Orange 500
  '#e91e63', // Pink 500
  '#00bcd4', // Cyan 500
  '#8bc34a', // Light Green 500
  '#ffc107', // Amber 500
]

const THEME_OPTIONS = computed(() => [
  { value: 'light' as const, label: t('settings.themeLight') },
  { value: 'dark' as const, label: t('settings.themeDark') },
  { value: 'auto' as const, label: t('settings.themeAuto') },
])

const LANGUAGE_OPTIONS = computed(() => [
  { value: 'zh' as const, label: t('settings.languageZh') },
  { value: 'en' as const, label: t('settings.languageEn') },
])

const ensureSettings = async () => {
  if (props.initialSettings) {
    // 如果初始设置中有语言，应用它
    if (props.initialSettings.language) {
      await setLocale(props.initialSettings.language)
    }
    emit('settings-updated', settings.value)
    return
  }
  const stored = await getSettings()
  settings.value = stored
  // 如果存储的设置中有语言，应用它
  if (stored.language) {
    await setLocale(stored.language)
  }
  // 如果是自定义颜色，直接使用存储的值；否则使用 normalizeColorInput 转换
  customColor.value =
    stored.backgroundType === 'custom' ? stored.backgroundColor : normalizeColorInput(stored.backgroundColor)
  primaryCustomColor.value = stored.primaryColor || '#667eea'
  await applyBackground(stored)
  applyPrimaryColor(stored.primaryColor || '#667eea')
  applyTheme(stored.theme)
  emit('settings-updated', stored)
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
        const url = await fetchBingImageUrl(merged.backgroundImageUrl, !forceRefreshBing)
        if (url) {
          merged.backgroundImageUrl = url
        }
      }
    } else if (merged.backgroundType !== 'upload') {
      // 切换到非 Bing 背景时，清除缓存
      if (settings.value.backgroundType === 'bing') {
        await clearBingImageCache()
      }
      merged.backgroundImageUrl = ''
    }

    // 先更新 settings.value，确保响应式更新
    settings.value = { ...merged }
    applyTheme(merged.theme)
    const fetched = await applyBackground(merged)
    if (fetched) {
      settings.value.backgroundImageUrl = fetched
    }
    applyPrimaryColor(settings.value.primaryColor || '#667eea')
    await saveSettings(settings.value)
    emit('settings-updated', settings.value)
  } finally {
    applying.value = false
    bingLoading.value = false
  }
}

const usePreset = async (value: string) => {
  await persistAndApply({ backgroundType: 'preset', backgroundColor: value })
}

const handleCustomColorInput = async (event: Event) => {
  const target = event.target as HTMLInputElement
  // 确保使用最新的颜色值
  customColor.value = target.value
  await persistAndApply({ backgroundType: 'custom', backgroundColor: target.value })
}

const usePrimaryPreset = async (value: string) => {
  await persistAndApply({ primaryColorType: 'preset', primaryColor: value })
}

const usePrimaryCustom = async () => {
  await persistAndApply({ primaryColorType: 'custom', primaryColor: primaryCustomColor.value })
}

const refreshBing = async () => {
  bingLoading.value = true
  await persistAndApply({ backgroundType: 'bing', backgroundImageUrl: '' }, true)
}

const isPresetActive = (value: string) =>
  settings.value.backgroundType === 'preset' && settings.value.backgroundColor === value

const isCustomActive = () =>
  settings.value.backgroundType === 'custom' && settings.value.backgroundColor === customColor.value

const isPrimaryActive = (value: string) =>
  settings.value.primaryColorType === 'preset' && settings.value.primaryColor === value

const isPrimaryCustomActive = () => settings.value.primaryColorType === 'custom'

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

const toggleVisibility = async (key: 'showDateTime' | 'showQuickAccess' | 'showHistory' | 'iconOnlyLinkCards') => {
  await persistAndApply({ [key]: !settings.value[key] })
}

const getSwitchTrackStyle = (on: boolean) => {
  // ON：明显的主色系高亮；OFF：保持中性
  // 这里用 color-mix 让主色跟 overlay 融合，避免纯色过刺眼
  const primary = 'var(--primary-color, #667eea)'
  const base = 'var(--app-bg-overlay)'
  const baseHover = 'var(--app-bg-overlay-hover)'
  return {
    backgroundColor: on ? `color-mix(in srgb, ${primary} 58%, ${baseHover})` : base,
    borderColor: on ? `color-mix(in srgb, ${primary} 42%, var(--app-border-color-hover))` : 'var(--app-border-color)',
  } as const
}

const useTheme = async (theme: Settings['theme']) => {
  // 根据新主题自动切换到对应的背景色和主色
  const newBg =
    theme === 'light'
      ? THEME_LIGHT_BG
      : theme === 'dark'
        ? THEME_DARK_BG
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? THEME_DARK_BG
          : THEME_LIGHT_BG

  // 主色也联动到对应的主题背景色（PRIMARY_PRESETS 的前两个）
  const newPrimary = newBg

  // 更新主题、背景和主色，确保类型都是 preset
  await persistAndApply({
    theme,
    backgroundType: 'preset',
    backgroundColor: newBg,
    primaryColorType: 'preset',
    primaryColor: newPrimary,
  })
}

const currentLanguage = computed<SupportedLocale>(() => {
  return getLocale()
})

const useLanguage = async (lang: SupportedLocale) => {
  await setLocale(lang)
  // persistAndApply 会保存设置，包括 language 字段
  await persistAndApply({ language: lang })
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
