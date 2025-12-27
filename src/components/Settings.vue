<template>
  <aside class="settings-anchor fixed z-50 flex flex-col items-end gap-3" :aria-label="tFn('settings.title')">
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
        class="border-app bg-app-overlay text-app-secondary ring-app-border max-h-[calc(100dvh-8rem)] w-[min(92vw,360px)] overflow-x-hidden overflow-y-auto rounded-2xl border p-4 shadow-(--app-shadow-lg) ring-1 backdrop-blur-2xl"
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
                ...getPrimaryPresetStyle(color),
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
              <span>{{ tFn('settings.openLinksInNewTab') }}</span>
              <button
                type="button"
                role="switch"
                :aria-checked="settings.openLinksInNewTab"
                class="border-app relative h-6 w-11 cursor-pointer rounded-full border shadow-(--app-shadow-xs) ring-2 ring-transparent transition-colors focus:ring-(--app-focus-ring) focus:outline-none disabled:opacity-60"
                :style="getSwitchTrackStyle(settings.openLinksInNewTab)"
                :disabled="applying"
                @click="toggleVisibility('openLinksInNewTab')"
              >
                <span
                  class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow-(--app-shadow-xs) transition-transform"
                  style="background-color: var(--app-text-color)"
                  :class="settings.openLinksInNewTab ? 'translate-x-5' : 'translate-x-0'"
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

        <div class="mt-4">
          <div class="mb-4 text-base font-semibold">{{ tFn('settings.customCss') }}</div>

          <label
            class="border-app bg-app-overlay text-app-secondary bg-app-overlay-hover flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm shadow-(--app-shadow-xs) backdrop-blur-sm transition"
          >
            <span>{{ tFn('settings.customCssEnable') }}</span>
            <button
              type="button"
              role="switch"
              :aria-checked="settings.customCssEnabled"
              class="border-app relative h-6 w-11 cursor-pointer rounded-full border shadow-(--app-shadow-xs) ring-2 ring-transparent transition-colors focus:ring-(--app-focus-ring) focus:outline-none disabled:opacity-60"
              :style="getSwitchTrackStyle(settings.customCssEnabled)"
              :disabled="applying"
              @click="toggleCustomCssEnabled"
            >
              <span
                class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow-(--app-shadow-xs) transition-transform"
                style="background-color: var(--app-text-color)"
                :class="settings.customCssEnabled ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </label>

          <div class="border-app bg-app-overlay mt-3 rounded-xl border p-3 shadow-(--app-shadow-xs) backdrop-blur-sm">
            <textarea
              v-model="customCssDraft"
              class="border-app bg-app-overlay text-app placeholder:text-app-secondary w-full resize-y rounded-lg border p-3 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-(--app-focus-ring)"
              :placeholder="tFn('settings.customCssPlaceholder')"
              rows="7"
              spellcheck="false"
              autocapitalize="off"
              autocomplete="off"
              :disabled="applying"
            />

            <div class="text-app-secondary mt-2 text-[11px] leading-relaxed">
              {{ tFn('settings.customCssHint') }}
            </div>

            <div class="mt-3 flex items-center justify-end gap-2">
              <button
                class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app inline-flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="applying || (!customCssDraft && !settings.customCss)"
                @click="clearCustomCss"
              >
                {{ tFn('common.clear') }}
              </button>
              <button
                class="border-app text-app bg-app-overlay bg-app-overlay-hover inline-flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="applying || !customCssChanged"
                @click="saveCustomCss"
              >
                {{ tFn('common.save') }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <div class="mb-4 text-base font-semibold">{{ tFn('settings.backup') }}</div>
          <div
            class="border-app bg-app-overlay text-app-secondary flex flex-col gap-2 rounded-xl border p-3 text-xs shadow-(--app-shadow-xs) backdrop-blur-sm"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <button
                class="border-app text-app bg-app-overlay bg-app-overlay-hover inline-flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="applying || backupBusy"
                @click="exportBackup"
              >
                {{ tFn('settings.exportBackup') }}
              </button>

              <button
                class="border-app text-app bg-app-overlay bg-app-overlay-hover relative inline-flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="applying || backupBusy"
                @click="triggerImport"
              >
                <input
                  ref="backupFileInput"
                  type="file"
                  accept="application/json,.json"
                  class="hidden"
                  @change="handleImport"
                />
                {{ tFn('settings.importBackup') }}
              </button>
            </div>

            <div class="text-app-secondary text-[11px] leading-relaxed">
              {{ tFn('settings.backupHint') }}
            </div>

            <div
              v-if="backupMessage"
              class="text-[11px] leading-relaxed"
              :class="backupError ? 'text-red-400' : 'text-app-secondary'"
            >
              {{ backupMessage }}
            </div>
          </div>
        </div>
      </section>
    </Transition>
  </aside>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'

import type { SupportedLocale } from '@/i18n'
import { getLocale, setLocale, t } from '@/i18n'
import { useI18n } from '@/i18n/composable'
import { applyCustomCss } from '@/utils/customCss'
import { buildSettingsBackup, parseAndSanitizeSettingsBackup } from '@/utils/settingsTransfer'
import type { Settings } from '@/utils/storage'
import { DEFAULT_SETTINGS, getQuickLinks, getSettings, saveQuickLinks, saveSettings } from '@/utils/storage'
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
  /**
   * 外部同步的 settings（例如来自 App.vue 的 storage.onChanged 监听）。
   * 用于在多个打开的新标签页之间实时刷新设置面板 UI。
   */
  syncedSettings?: Settings | null
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
const customCssDraft = ref(settings.value.customCss || '')
const applying = ref(false)
const bingLoading = ref(false)
const open = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const backupFileInput = ref<HTMLInputElement | null>(null)
const backupBusy = ref(false)
const backupMessage = ref('')
const backupError = ref(false)

const PRIMARY_PRESETS = [
  THEME_LIGHT_BG,
  THEME_DARK_BG,
  'transparent',
  '#6200ea', // Deep Purple 500
  '#2962ff', // Blue A700
  '#00c853', // Green A700
  '#ff9800', // Orange 500
  '#e91e63', // Pink 500
  '#00bcd4', // Cyan 500
  '#8bc34a', // Light Green 500
  '#ffc107', // Amber 500
]

const getPrimaryPresetStyle = (color: string) => {
  // 透明色需要可视化：用棋盘格提示“透明”
  if (color === 'transparent') {
    return {
      backgroundColor: 'transparent',
      backgroundImage:
        'linear-gradient(45deg, rgba(255,255,255,0.16) 25%, transparent 25%),' +
        'linear-gradient(-45deg, rgba(255,255,255,0.16) 25%, transparent 25%),' +
        'linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.16) 75%),' +
        'linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.16) 75%)',
      backgroundSize: '12px 12px',
      backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
    } as const
  }
  return { background: color } as const
}

const THEME_OPTIONS = computed(() => [
  { value: 'light' as const, label: t('settings.themeLight') },
  { value: 'dark' as const, label: t('settings.themeDark') },
  { value: 'auto' as const, label: t('settings.themeAuto') },
])

const LANGUAGE_OPTIONS = computed(() => [
  { value: 'zh' as const, label: t('settings.languageZh') },
  { value: 'en' as const, label: t('settings.languageEn') },
])

const syncUiFromSettings = async (next: Settings) => {
  settings.value = { ...DEFAULT_SETTINGS, ...next }

  // 同步语言（让 UI 立即切换）
  if (next.language) {
    await setLocale(next.language)
  }

  // 同步颜色输入/草稿状态，避免面板显示滞后
  customColor.value =
    next.backgroundType === 'custom' ? next.backgroundColor : normalizeColorInput(next.backgroundColor)
  primaryCustomColor.value = next.primaryColor || '#667eea'
  customCssDraft.value = next.customCss || ''
}

const ensureSettings = async () => {
  // 如果外部已经提供了最新的 settings，就以它为准（避免重复 getSettings + 避免与跨标签页同步冲突）
  if (props.syncedSettings) {
    await syncUiFromSettings(props.syncedSettings)
    emit('settings-updated', settings.value)
    return
  }
  if (props.initialSettings) {
    // 如果初始设置中有语言，应用它
    if (props.initialSettings.language) {
      await setLocale(props.initialSettings.language)
    }
    customCssDraft.value = props.initialSettings.customCss || ''
    applyCustomCss(props.initialSettings)
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
  customCssDraft.value = stored.customCss || ''
  await applyBackground(stored)
  applyPrimaryColor(stored.primaryColor || '#667eea')
  applyTheme(stored.theme)
  applyCustomCss(stored)
  emit('settings-updated', stored)
}

onMounted(async () => {
  await ensureSettings()
})

watch(
  () => props.syncedSettings,
  async next => {
    if (!next) return
    await syncUiFromSettings(next)
  },
  { deep: true }
)

const toggle = () => {
  open.value = !open.value
}

const formatDateForFileName = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

const exportBackup = async () => {
  backupBusy.value = true
  backupError.value = false
  backupMessage.value = ''
  try {
    const s = await getSettings()
    const links = await getQuickLinks()
    const backup = buildSettingsBackup({ settings: s, quickLinks: links })
    const text = JSON.stringify(backup, null, 2)
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tablite-backup-${formatDateForFileName(new Date())}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    backupMessage.value = t('settings.exportSuccess')
  } catch {
    backupError.value = true
    backupMessage.value = t('settings.exportFailed')
  } finally {
    backupBusy.value = false
  }
}

const triggerImport = () => {
  backupMessage.value = ''
  backupError.value = false
  backupFileInput.value?.click()
}

const handleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  // 允许再次选择同一文件
  target.value = ''
  if (!file) return

  const MAX_BYTES = 8 * 1024 * 1024
  if (file.size > MAX_BYTES) {
    backupError.value = true
    backupMessage.value = t('settings.importTooLarge')
    return
  }

  backupBusy.value = true
  backupError.value = false
  backupMessage.value = ''

  try {
    const text = await file.text()
    const parsed = parseAndSanitizeSettingsBackup(text)
    if (!parsed.ok) {
      backupError.value = true
      backupMessage.value = t('settings.importInvalid')
      return
    }

    // 先切换语言（让 UI 立即刷新），再保存设置
    if (parsed.settings.language) {
      await setLocale(parsed.settings.language)
    }

    await saveQuickLinks(parsed.quickLinks)
    await persistAndApply(parsed.settings)

    // 同步本地 UI 草稿状态，避免导入后显示不一致
    customCssDraft.value = settings.value.customCss || ''
    customColor.value =
      settings.value.backgroundType === 'custom'
        ? settings.value.backgroundColor
        : normalizeColorInput(settings.value.backgroundColor)
    primaryCustomColor.value = settings.value.primaryColor || '#667eea'

    backupMessage.value =
      parsed.warnings.length > 0
        ? `${t('settings.importSuccess')} (${t('settings.importWithWarnings')})`
        : t('settings.importSuccess')
  } catch {
    backupError.value = true
    backupMessage.value = t('settings.importFailed')
  } finally {
    backupBusy.value = false
  }
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
    applyCustomCss(settings.value)
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

const toggleVisibility = async (
  key: 'showDateTime' | 'showQuickAccess' | 'showHistory' | 'openLinksInNewTab' | 'iconOnlyLinkCards'
) => {
  await persistAndApply({ [key]: !settings.value[key] })
}

const customCssChanged = computed(() => (customCssDraft.value || '') !== (settings.value.customCss || ''))

const saveCustomCss = async () => {
  await persistAndApply({ customCss: customCssDraft.value })
}

const clearCustomCss = async () => {
  customCssDraft.value = ''
  await persistAndApply({ customCss: '', customCssEnabled: false })
}

const toggleCustomCssEnabled = async () => {
  const nextEnabled = !settings.value.customCssEnabled
  // 启用/禁用时也把当前草稿写入，避免“开关开了但还是旧 CSS”
  await persistAndApply({ customCssEnabled: nextEnabled, customCss: customCssDraft.value })
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
.settings-anchor {
  top: max(1rem, env(safe-area-inset-top));
  right: max(1rem, env(safe-area-inset-right));
}

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
