<template>
  <div class="app-container">
    <main
      class="app-main relative flex min-h-dvh w-full flex-col items-center px-[clamp(20px,5vw,60px)] py-[clamp(24px,5vh,56px)]"
      role="main"
    >
      <Settings
        :initial-settings="props.initialSettings"
        :synced-settings="settings"
        @settings-updated="handleSettingsUpdate"
      />
      <header
        class="mb-2"
        :class="{
          invisible: !displaySettings.showDateTime,
          'pointer-events-none': !displaySettings.showDateTime,
        }"
        :aria-hidden="!displaySettings.showDateTime"
      >
        <DateTime />
      </header>

      <section class="mt-6 mb-8 w-full md:mb-6" :aria-label="t('search.siteSearch')">
        <SearchBox />
      </section>
      <QuickAccessList v-if="displaySettings.showQuickAccess" />
      <HistoryList v-if="displaySettings.showHistory" />
    </main>
  </div>
</template>
<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

import DateTime from '@/components/DateTime.vue'
import HistoryList from '@/components/HistoryList.vue'
import QuickAccessList from '@/components/QuickAccessList.vue'
import SearchBox from '@/components/SearchBox.vue'
import Settings from '@/components/Settings.vue'
import { useI18n } from '@/i18n/composable'
import { applyCustomCss } from '@/utils/customCss'
import { getSettings, saveSettings, type Settings as SettingsModel } from '@/utils/storage'
import { applyBackground, applyPrimaryColor, applyTheme } from '@/utils/theme'

const { t } = useI18n()

const props = defineProps<{ initialSettings?: SettingsModel }>()

const settings = ref<SettingsModel | null>(props.initialSettings || null)

const displaySettings = computed(() => ({
  showDateTime: settings.value?.showDateTime ?? true,
  showQuickAccess: settings.value?.showQuickAccess ?? true,
  showHistory: settings.value?.showHistory ?? true,
}))

/**
 * 比较两个设置对象是否相同
 * 使用规范化后的值进行比较，处理 undefined/null 的情况
 * 自动比较所有字段，无需在新增字段时手动更新此函数
 */
const isSameSettings = (a: SettingsModel | null, b: SettingsModel | null): boolean => {
  if (!a || !b) return false

  // 规范化可选字段的默认值
  const normalize = {
    backgroundOpacity: (v: number | undefined) => v ?? 1,
    primaryOpacity: (v: number | undefined) => v ?? 1,
    backgroundImageUrl: (v: string | undefined) => v || '',
    language: (v: string | undefined) => v || '',
  }

  // 获取所有需要比较的字段（排除函数、方法等）
  const getComparableFields = (settings: SettingsModel) => {
    const fields: Record<string, unknown> = {}
    for (const key in settings) {
      if (Object.prototype.hasOwnProperty.call(settings, key)) {
        const value = settings[key as keyof SettingsModel]
        // 规范化可选字段
        if (key === 'backgroundOpacity' || key === 'primaryOpacity') {
          fields[key] = normalize[key](value as number | undefined)
        } else if (key === 'backgroundImageUrl') {
          fields[key] = normalize.backgroundImageUrl(value as string | undefined)
        } else if (key === 'language') {
          fields[key] = normalize.language(value as string | undefined)
        } else {
          fields[key] = value
        }
      }
    }
    return fields
  }

  const fieldsA = getComparableFields(a)
  const fieldsB = getComparableFields(b)

  // 比较所有字段
  const keysA = Object.keys(fieldsA)
  const keysB = Object.keys(fieldsB)

  // 确保两个对象有相同的字段
  if (keysA.length !== keysB.length) return false

  // 比较每个字段的值
  for (const key of keysA) {
    if (!(key in fieldsB)) return false
    if (fieldsA[key] !== fieldsB[key]) return false
  }

  return true
}

const handleSettingsUpdate = async (updatedSettings: SettingsModel) => {
  settings.value = updatedSettings
  applyTheme(updatedSettings.theme)
  await applyBackground(updatedSettings)
  applyPrimaryColor(updatedSettings.primaryColor, updatedSettings.primaryOpacity ?? 1)
  applyCustomCss(updatedSettings)
}

const onStorageChanged = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
  if (areaName !== 'local') return
  const change = changes.settings
  if (!change?.newValue) return
  const next = change.newValue as SettingsModel
  if (isSameSettings(settings.value, next)) return
  void handleSettingsUpdate(next)
}

onMounted(async () => {
  if (!props.initialSettings) {
    const loadedSettings = await getSettings()
    settings.value = loadedSettings
    applyTheme(loadedSettings.theme)
    const fetched = await applyBackground(loadedSettings)
    applyPrimaryColor(loadedSettings.primaryColor, loadedSettings.primaryOpacity)
    applyCustomCss(loadedSettings)
    if (loadedSettings.backgroundType === 'bing' && fetched && !loadedSettings.backgroundImageUrl) {
      const next = { ...loadedSettings, backgroundImageUrl: fetched }
      settings.value = next
      await saveSettings(next)
    }
  }
  chrome.storage.onChanged.addListener(onStorageChanged)
})

onUnmounted(() => {
  chrome.storage.onChanged.removeListener(onStorageChanged)
})
</script>
<style scoped>
.app-container {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  overflow-y: auto;
  overflow-x: hidden;
  /* 核心：scrollbar-gutter: stable 预留空间防止跳动，搭配 both-edges 确保居中平衡 */
  scrollbar-gutter: stable both-edges;
}

/* 自定义滚动条样式 */
.app-container::-webkit-scrollbar {
  width: 12px; /* 稍微增加宽度，使拇指通过 border 缩进后更精致 */
}

.app-container::-webkit-scrollbar-track {
  background: transparent !important;
}

.app-container::-webkit-scrollbar-thumb {
  /* 滚动条滑块不透明，背景轨道保持透明 */
  background-color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 10px !important;
  /* 利用厚边框和 background-clip 实现滑块在轨道中心悬浮的效果，轨道背景依然透明 */
  border: 4px solid transparent !important;
  background-clip: padding-box !important;
}

.app-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 1) !important;
}

/* 兼容 Firefox */
.app-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.8) transparent;
}

/* 浅色模式适配 */
:global(.light) .app-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.6) !important;
}

:global(.light) .app-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.8) !important;
}

:global(.light) .app-container {
  scrollbar-color: rgba(0, 0, 0, 0.6) transparent;
}
</style>
