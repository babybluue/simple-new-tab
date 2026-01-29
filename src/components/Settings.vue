<template>
  <aside
    ref="anchorEl"
    class="settings-anchor fixed z-50 flex flex-col items-end gap-3"
    :aria-label="tFn('settings.title')"
  >
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
          <div class="mb-4 flex items-center justify-between">
            <div class="text-base font-semibold">{{ tFn('settings.language') }}</div>
            <button
              v-if="LANGUAGE_OPTIONS.length > FIRST_ROW_LANGUAGES.length"
              class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition focus:outline-none"
              type="button"
              :aria-expanded="languageExpanded"
              :aria-label="languageExpanded ? tFn('common.collapse') : tFn('common.expand')"
              @click="languageExpanded = !languageExpanded"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 transition-transform duration-200"
                :class="{ 'rotate-180': languageExpanded }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="langOption in visibleLanguageOptions"
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
          <div class="mb-4 flex items-center justify-between">
            <div class="text-base font-semibold">{{ tFn('settings.background') }}</div>
            <button
              class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition focus:outline-none"
              type="button"
              :aria-expanded="backgroundExpanded"
              :aria-label="backgroundExpanded ? tFn('common.collapse') : tFn('common.expand')"
              @click="backgroundExpanded = !backgroundExpanded"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 transition-transform duration-200"
                :class="{ 'rotate-180': backgroundExpanded }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <Transition name="collapse">
            <div v-show="backgroundExpanded">
              <div class="grid w-full grid-cols-[repeat(auto-fit,2.5rem)] justify-between gap-2">
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
                    @change="handleCustomColorChange"
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
                class="border-app bg-app-overlay text-app-secondary mt-3 flex items-center justify-between gap-3 rounded-xl border px-3 py-4 text-xs shadow-(--app-shadow-xs) backdrop-blur-sm"
              >
                <span>{{ tFn('settings.backgroundOpacity') }}</span>
                <div class="flex items-center gap-2">
                  <input
                    class="w-36"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    :value="backgroundOpacityDraft"
                    :disabled="applying || settings.backgroundColor.includes('gradient')"
                    @input="handleBackgroundOpacityInput"
                    @change="handleBackgroundOpacityChange"
                  />
                  <span class="text-app w-10 text-right tabular-nums">{{ backgroundOpacityDraft }}%</span>
                </div>
              </div>

              <div
                class="border-app bg-app-overlay text-app-secondary mt-3 flex items-center justify-between rounded-xl border px-3 py-2 text-xs shadow-(--app-shadow-xs) backdrop-blur-sm"
              >
                <span>{{ tFn('settings.dailyBingWallpaper') }}</span>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="settings.dailyBingEnabled"
                  class="border-app relative h-6 w-11 cursor-pointer rounded-full border shadow-(--app-shadow-xs) ring-2 ring-transparent transition-colors focus:ring-(--app-focus-ring) focus:outline-none disabled:opacity-60"
                  :style="getSwitchTrackStyle(settings.dailyBingEnabled)"
                  :disabled="applying"
                  @click="toggleDailyBing"
                >
                  <span
                    class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow-(--app-shadow-xs) transition-transform"
                    style="background-color: var(--app-text-color)"
                    :class="settings.dailyBingEnabled ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>

              <div
                class="border-app bg-app-overlay text-app-secondary mt-3 flex items-center justify-between rounded-xl border px-3 py-2 text-xs shadow-(--app-shadow-xs) backdrop-blur-sm"
              >
                <span>{{ tFn('settings.refreshBingWallpaper') }}</span>
                <button
                  class="border-app text-app bg-app-overlay bg-app-overlay-hover flex cursor-pointer items-center justify-center gap-1 rounded-lg border px-5 py-2 text-xs font-medium transition disabled:opacity-60"
                  type="button"
                  :disabled="bingLoading || applying"
                  @click="refreshBing"
                >
                  {{ tFn('common.refresh') }}
                </button>
              </div>

              <div
                class="border-app bg-app-overlay text-app-secondary mt-3 flex items-center justify-between rounded-xl border px-3 py-2 text-xs shadow-(--app-shadow-xs) backdrop-blur-sm"
              >
                <span>{{ tFn('settings.uploadImage') }}</span>
                <button
                  class="border-app text-app bg-app-overlay bg-app-overlay-hover relative flex cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-lg border px-5 py-2 text-xs font-medium transition disabled:opacity-60"
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
                  {{ tFn('common.upload') }}
                </button>
              </div>

              <div
                class="border-app bg-app-overlay mt-3 rounded-xl border p-3 shadow-(--app-shadow-xs) backdrop-blur-sm"
              >
                <div class="text-app-secondary mb-2 text-xs">
                  {{ tFn('settings.onlineImage') }}
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model="onlineImageUrlDraft"
                    class="border-app bg-app-overlay text-app placeholder:text-app-secondary min-w-0 flex-1 rounded-lg border px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-(--app-focus-ring)"
                    type="url"
                    inputmode="url"
                    autocomplete="off"
                    autocapitalize="off"
                    spellcheck="false"
                    :placeholder="tFn('settings.onlineImagePlaceholder')"
                    :disabled="applying"
                    @keydown.enter.prevent="useOnlineImageUrl"
                  />
                  <button
                    class="border-app text-app bg-app-overlay bg-app-overlay-hover flex cursor-pointer items-center justify-center gap-1 rounded-lg border px-5 py-2 text-xs font-medium transition disabled:opacity-60"
                    type="button"
                    :disabled="applying"
                    @click="useOnlineImageUrl"
                  >
                    {{ tFn('common.save') }}
                  </button>
                </div>
                <div v-if="onlineUrlInvalid" class="mt-2 text-[11px] leading-relaxed text-red-400">
                  {{ tFn('settings.onlineImageInvalid') }}
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="mt-4">
          <div class="mb-4 flex items-center justify-between">
            <div class="text-base font-semibold">{{ tFn('settings.primaryColor') }}</div>
            <button
              class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition focus:outline-none"
              type="button"
              :aria-expanded="primaryColorExpanded"
              :aria-label="primaryColorExpanded ? tFn('common.collapse') : tFn('common.expand')"
              @click="primaryColorExpanded = !primaryColorExpanded"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 transition-transform duration-200"
                :class="{ 'rotate-180': primaryColorExpanded }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <Transition name="collapse">
            <div v-show="primaryColorExpanded">
              <div class="grid w-full grid-cols-[repeat(auto-fit,2.5rem)] justify-between gap-2">
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
                >
                  <input
                    v-model="primaryCustomColor"
                    type="color"
                    class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    :title="tFn('settings.primaryColorCustom')"
                    @input="handlePrimaryColorInput"
                    @change="handlePrimaryColorChange"
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
                class="border-app bg-app-overlay text-app-secondary mt-3 flex items-center justify-between gap-3 rounded-xl border px-3 py-4 text-xs shadow-(--app-shadow-xs) backdrop-blur-sm"
              >
                <span>{{ tFn('settings.primaryOpacity') }}</span>
                <div class="flex items-center gap-2">
                  <input
                    class="w-36"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    :value="primaryOpacityDraft"
                    :disabled="applying"
                    @input="handlePrimaryOpacityInput"
                    @change="handlePrimaryOpacityChange"
                  />
                  <span class="text-app w-10 text-right tabular-nums">{{ primaryOpacityDraft }}%</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="mt-4">
          <div class="mb-4 flex items-center justify-between">
            <div class="text-base font-semibold">{{ tFn('settings.controls') }}</div>
            <button
              class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition focus:outline-none"
              type="button"
              :aria-expanded="controlsExpanded"
              :aria-label="controlsExpanded ? tFn('common.collapse') : tFn('common.expand')"
              @click="controlsExpanded = !controlsExpanded"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 transition-transform duration-200"
                :class="{ 'rotate-180': controlsExpanded }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <Transition name="collapse">
            <div v-show="controlsExpanded" class="space-y-3">
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
                v-if="currentLanguage === 'zh_CN' || currentLanguage === 'zh_TW'"
                class="border-app bg-app-overlay text-app-secondary bg-app-overlay-hover flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm shadow-(--app-shadow-xs) backdrop-blur-sm transition"
              >
                <span>{{ tFn('settings.lunarCalendar') }}</span>
                <button
                  type="button"
                  role="switch"
                  :aria-checked="settings.showLunarCalendar"
                  class="border-app relative h-6 w-11 cursor-pointer rounded-full border shadow-(--app-shadow-xs) ring-2 ring-transparent transition-colors focus:ring-(--app-focus-ring) focus:outline-none disabled:opacity-60"
                  :style="getSwitchTrackStyle(settings.showLunarCalendar)"
                  :disabled="applying"
                  @click="toggleVisibility('showLunarCalendar')"
                >
                  <span
                    class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow-(--app-shadow-xs) transition-transform"
                    style="background-color: var(--app-text-color)"
                    :class="settings.showLunarCalendar ? 'translate-x-5' : 'translate-x-0'"
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
          </Transition>
        </div>

        <div class="mt-4">
          <div class="mb-4 flex items-center justify-between">
            <div class="text-base font-semibold">{{ tFn('settings.customCss') }}</div>
            <button
              class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition focus:outline-none"
              type="button"
              :aria-expanded="customCssExpanded"
              :aria-label="customCssExpanded ? tFn('common.collapse') : tFn('common.expand')"
              @click="customCssExpanded = !customCssExpanded"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 transition-transform duration-200"
                :class="{ 'rotate-180': customCssExpanded }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <Transition name="collapse">
            <div v-show="customCssExpanded">
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

              <div
                class="border-app bg-app-overlay mt-3 rounded-xl border p-3 shadow-(--app-shadow-xs) backdrop-blur-sm"
              >
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
          </Transition>
        </div>

        <div class="mt-4">
          <div class="mb-4 flex items-center justify-between">
            <div class="text-base font-semibold">{{ tFn('settings.backup') }}</div>
            <button
              class="border-app bg-app-overlay bg-app-overlay-hover text-app-secondary hover:text-app flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition focus:outline-none"
              type="button"
              :aria-expanded="backupExpanded"
              :aria-label="backupExpanded ? tFn('common.collapse') : tFn('common.expand')"
              @click="backupExpanded = !backupExpanded"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 transition-transform duration-200"
                :class="{ 'rotate-180': backupExpanded }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <Transition name="collapse">
            <div v-show="backupExpanded">
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
          </Transition>
        </div>
      </section>
    </Transition>
  </aside>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import type { SupportedLocale } from '@/i18n'
import { getLocale, setLocale, t } from '@/i18n'
import { useI18n } from '@/i18n/composable'
import { applyCustomCss } from '@/utils/customCss'
import { getTodayKey } from '@/utils/date'
import { buildSettingsBackup, parseAndSanitizeSettingsBackup } from '@/utils/settingsTransfer'
import type { Settings } from '@/utils/storage'
import { DEFAULT_SETTINGS, getQuickLinks, getSettings, saveQuickLinks, saveSettings } from '@/utils/storage'
import {
  applyBackground,
  applyPrimaryColor,
  applyTheme,
  clearBingImageCache,
  ensureBingImageCached,
  fetchBingImageUrl,
  getDailyBingImageUrl,
  getThemeDefaults,
  PRESET_BACKGROUNDS,
  PRIMARY_PRESETS,
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

// 辅助函数
const isHexColor6 = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)

// 获取主题对应的默认背景色（用于颜色选择器的 fallback）
const getDefaultBgHex = (theme: Settings['theme']) => getThemeDefaults(theme).backgroundColor

// 获取主题对应的默认主色（用于颜色选择器的 fallback）
const getDefaultPrimaryHex = (theme: Settings['theme']) => getThemeDefaults(theme).primaryColor

const normalizeColorInput = (value: string | undefined, fallback: string) => {
  if (!value) return fallback
  return value === 'transparent' || value.startsWith('linear') || value.startsWith('radial') ? fallback : value
}

const normalizeColorPickerValue = (value: string | undefined, fallback: string) => {
  if (!value) return fallback
  return isHexColor6(value) ? value : fallback
}

const isHttpUrl = (url: string): boolean => {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

const settings = ref<Settings>({ ...(props.initialSettings || DEFAULT_SETTINGS) })
const customColor = ref(normalizeColorInput(settings.value.backgroundColor, getDefaultBgHex(settings.value.theme)))
const primaryCustomColor = ref(
  normalizeColorPickerValue(settings.value.primaryColor, getDefaultPrimaryHex(settings.value.theme))
)
const backgroundOpacityDraft = ref(Math.round((settings.value.backgroundOpacity ?? 1) * 100))
const primaryOpacityDraft = ref(Math.round((settings.value.primaryOpacity ?? 1) * 100))
const customCssDraft = ref(settings.value.customCss || '')
const onlineImageUrlDraft = ref(settings.value.backgroundType === 'url' ? settings.value.backgroundImageUrl || '' : '')
const applying = ref(false)
const bingLoading = ref(false)
const open = ref(false)
const languageExpanded = ref(false)
const backgroundExpanded = ref(true)
const primaryColorExpanded = ref(true)
const controlsExpanded = ref(false)
const customCssExpanded = ref(false)
const backupExpanded = ref(false)
const anchorEl = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const backupFileInput = ref<HTMLInputElement | null>(null)
const backupBusy = ref(false)
const backupMessage = ref('')
const backupError = ref(false)

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
  { value: 'zh_CN' as const, label: t('settings.languageZhCN') },
  { value: 'zh_TW' as const, label: t('settings.languageZhTW') },
  { value: 'en' as const, label: t('settings.languageEn') },
  { value: 'ja' as const, label: t('settings.languageJa') },
  { value: 'ko' as const, label: t('settings.languageKo') },
  { value: 'fr' as const, label: t('settings.languageFr') },
  { value: 'de' as const, label: t('settings.languageDe') },
  { value: 'es' as const, label: t('settings.languageEs') },
  { value: 'ru' as const, label: t('settings.languageRu') },
])

// 第一行显示的语言（简体中文、繁体中文、英文）
const FIRST_ROW_LANGUAGES: readonly SupportedLocale[] = ['zh_CN', 'zh_TW', 'en'] as const

// 根据展开状态返回可见的语言选项
const visibleLanguageOptions = computed(() => {
  if (languageExpanded.value) {
    return LANGUAGE_OPTIONS.value
  }
  return LANGUAGE_OPTIONS.value.filter(lang => FIRST_ROW_LANGUAGES.includes(lang.value))
})

const syncUiFromSettings = async (next: Settings) => {
  const merged = { ...DEFAULT_SETTINGS, ...next }
  settings.value = merged

  // 同步语言（让 UI 立即切换）
  if (merged.language) {
    await setLocale(merged.language)
  }

  // 同步颜色输入/草稿状态，避免面板显示滞后
  customColor.value =
    merged.backgroundType === 'custom'
      ? merged.backgroundColor
      : normalizeColorInput(merged.backgroundColor, getDefaultBgHex(merged.theme))
  primaryCustomColor.value = normalizeColorPickerValue(merged.primaryColor, getDefaultPrimaryHex(merged.theme))
  backgroundOpacityDraft.value = Math.round((merged.backgroundOpacity ?? 1) * 100)
  primaryOpacityDraft.value = Math.round((merged.primaryOpacity ?? 1) * 100)
  customCssDraft.value = merged.customCss || ''
  onlineImageUrlDraft.value =
    merged.backgroundType === 'url' ? merged.backgroundImageUrl || '' : onlineImageUrlDraft.value
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
    stored.backgroundType === 'custom'
      ? stored.backgroundColor
      : normalizeColorInput(stored.backgroundColor, getDefaultBgHex(stored.theme))
  primaryCustomColor.value = normalizeColorPickerValue(stored.primaryColor, getDefaultPrimaryHex(stored.theme))
  customCssDraft.value = stored.customCss || ''
  onlineImageUrlDraft.value = stored.backgroundType === 'url' ? stored.backgroundImageUrl || '' : ''
  await applyBackground(stored)
  applyPrimaryColor(stored.primaryColor, stored.primaryOpacity ?? 1)
  applyTheme(stored.theme)
  applyCustomCss(stored)
  emit('settings-updated', stored)
}

onMounted(async () => {
  await ensureSettings()
})

const handleGlobalPointerDown = (event: PointerEvent) => {
  if (!open.value) return
  const anchor = anchorEl.value
  if (!anchor) return
  const target = event.target as Node | null
  if (!target) return

  // 点击设置区域（按钮/面板）内部不关闭；点击其它区域自动关闭
  if (!anchor.contains(target)) {
    open.value = false
  }
}

onMounted(() => {
  // capture：更贴近“点外部就关”的 dropdown 行为，也能覆盖触摸/笔场景
  document.addEventListener('pointerdown', handleGlobalPointerDown, true)
})

onUnmounted(() => {
  document.removeEventListener('pointerdown', handleGlobalPointerDown, true)
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
        : normalizeColorInput(settings.value.backgroundColor, getDefaultBgHex(settings.value.theme))
    primaryCustomColor.value = normalizeColorPickerValue(
      settings.value.primaryColor,
      getDefaultPrimaryHex(settings.value.theme)
    )

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
        // force refresh 时需要排除“当前正在用的那张”，而不是 next 里被清空的 URL
        const exclude = forceRefreshBing ? settings.value.backgroundImageUrl : merged.backgroundImageUrl
        const url = await fetchBingImageUrl(exclude, !forceRefreshBing)
        if (url) {
          merged.backgroundImageUrl = url
        }
      }
      if (
        merged.backgroundImageUrl &&
        (forceRefreshBing || merged.backgroundImageUrl !== settings.value.backgroundImageUrl)
      ) {
        await ensureBingImageCached(merged.backgroundImageUrl)
      }
    } else {
      // 离开 Bing 背景时，清除缓存（不影响 upload/url）
      if (settings.value.backgroundType === 'bing') {
        await clearBingImageCache()
      }

      // 仅在非图片背景类型时清空 backgroundImageUrl
      if (merged.backgroundType !== 'upload' && merged.backgroundType !== 'url') {
        merged.backgroundImageUrl = ''
      }
    }

    // 先更新 settings.value，确保响应式更新
    settings.value = { ...merged }
    applyTheme(merged.theme)
    const fetched = await applyBackground(merged)
    if (fetched) {
      settings.value.backgroundImageUrl = fetched
    }
    applyPrimaryColor(settings.value.primaryColor, settings.value.primaryOpacity ?? 1)
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

// Background Color：
// - input：只做预览（更新背景）；不落盘，避免拖动时频繁写入导致闪烁
// - change：用户确认后再一次性保存
const handleCustomColorInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const next = target.value
  customColor.value = next
  settings.value = {
    ...settings.value,
    backgroundType: 'custom',
    backgroundColor: next,
  }
  void applyBackground(settings.value)
}

const handleCustomColorChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const next = target.value
  customColor.value = next
  await persistAndApply({ backgroundType: 'custom', backgroundColor: next })
}

// Background Opacity：
// - input：只做预览（更新背景）；不落盘，避免拖动时频繁写入 storage
// - change：用户确认后再一次性保存
const handleBackgroundOpacityInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const n = Number.parseInt(target.value, 10)
  const pct = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 100
  backgroundOpacityDraft.value = pct
  const nextOpacity = pct / 100
  settings.value = { ...settings.value, backgroundOpacity: nextOpacity }
  void applyBackground(settings.value)
}

const handleBackgroundOpacityChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const n = Number.parseInt(target.value, 10)
  const pct = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 100
  backgroundOpacityDraft.value = pct
  await persistAndApply({ backgroundOpacity: pct / 100 })
}

const usePrimaryPreset = async (value: string) => {
  await persistAndApply({ primaryColorType: 'preset', primaryColor: value })
}

// Primary Color：
// - input：只做预览（更新 CSS 变量）；不落盘，避免并发写入导致抖动
// - change：用户确认后再一次性保存
const handlePrimaryColorInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const next = target.value
  primaryCustomColor.value = next
  settings.value = {
    ...settings.value,
    primaryColorType: 'custom',
    primaryColor: next,
  }
  applyPrimaryColor(next, settings.value.primaryOpacity ?? 1)
}

const handlePrimaryColorChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const next = target.value
  primaryCustomColor.value = next
  await persistAndApply({ primaryColorType: 'custom', primaryColor: next })
}

// Primary Opacity：input 预览，change 保存
const handlePrimaryOpacityInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const n = Number.parseInt(target.value, 10)
  const pct = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 100
  primaryOpacityDraft.value = pct
  const nextOpacity = pct / 100
  settings.value = { ...settings.value, primaryOpacity: nextOpacity }
  applyPrimaryColor(settings.value.primaryColor, nextOpacity)
}

const handlePrimaryOpacityChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const n = Number.parseInt(target.value, 10)
  const pct = Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 100
  primaryOpacityDraft.value = pct
  await persistAndApply({ primaryOpacity: pct / 100 })
}

const refreshBing = async () => {
  bingLoading.value = true
  await persistAndApply({ backgroundType: 'bing', backgroundImageUrl: '' }, true)
}

const toggleDailyBing = async () => {
  const nextEnabled = !settings.value.dailyBingEnabled
  if (!nextEnabled) {
    await persistAndApply({ dailyBingEnabled: false })
    return
  }
  const dailyUrl = getDailyBingImageUrl()
  await ensureBingImageCached(dailyUrl)
  await persistAndApply({
    dailyBingEnabled: true,
    dailyBingDate: getTodayKey(),
    backgroundType: 'bing',
    backgroundImageUrl: dailyUrl,
  })
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

const onlineUrlInvalid = computed(() => {
  const v = (onlineImageUrlDraft.value || '').trim()
  if (!v) return false
  return !isHttpUrl(v)
})

const useOnlineImageUrl = async () => {
  const v = (onlineImageUrlDraft.value || '').trim()
  if (!v || !isHttpUrl(v)) return
  await persistAndApply({ backgroundType: 'url', backgroundImageUrl: v })
}

const toggleVisibility = async (
  key:
    | 'showDateTime'
    | 'showQuickAccess'
    | 'showHistory'
    | 'openLinksInNewTab'
    | 'iconOnlyLinkCards'
    | 'showLunarCalendar'
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
  const primary = 'var(--primary-color)'
  const base = 'var(--app-bg-overlay)'
  const baseHover = 'var(--app-bg-overlay-hover)'
  return {
    backgroundColor: on ? `color-mix(in srgb, ${primary} 58%, ${baseHover})` : base,
    borderColor: on ? `color-mix(in srgb, ${primary} 42%, var(--app-border-color-hover))` : 'var(--app-border-color)',
  } as const
}

const useTheme = async (theme: Settings['theme']) => {
  // 根据新主题获取对应的默认背景色和主色
  const { backgroundColor, primaryColor } = getThemeDefaults(theme)

  // 更新主题、背景和主色，确保类型都是 preset
  await persistAndApply({
    theme,
    backgroundType: 'preset',
    backgroundColor,
    primaryColorType: 'preset',
    primaryColor,
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
#settings-panel {
  scrollbar-gutter: stable;
}

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

.collapse-enter-active,
.collapse-leave-active {
  transition:
    opacity 0.2s ease,
    max-height 0.3s ease;
  overflow: hidden;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}
.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 2000px;
}
</style>
