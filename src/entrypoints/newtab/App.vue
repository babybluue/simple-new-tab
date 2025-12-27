<template>
  <div class="app-container">
    <main
      class="app-main relative flex min-h-dvh w-full flex-col items-center px-[clamp(20px,5vw,60px)] py-[clamp(24px,5vh,56px)]"
      role="main"
    >
      <Settings :initial-settings="initialSettings" @settings-updated="handleSettingsUpdate" />
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
import { computed, onMounted, ref } from 'vue'

import DateTime from '@/components/DateTime.vue'
import HistoryList from '@/components/HistoryList.vue'
import QuickAccessList from '@/components/QuickAccessList.vue'
import SearchBox from '@/components/SearchBox.vue'
import Settings from '@/components/Settings.vue'
import { useI18n } from '@/i18n/composable'
import { applyCustomCss } from '@/utils/customCss'
import { getSettings, type Settings as SettingsModel } from '@/utils/storage'
import { applyBackground, applyPrimaryColor, applyTheme } from '@/utils/theme'

const { t } = useI18n()

const props = defineProps<{ initialSettings?: SettingsModel }>()
const initialSettings = props.initialSettings

const settings = ref<SettingsModel | null>(props.initialSettings || null)

const displaySettings = computed(() => ({
  showDateTime: settings.value?.showDateTime ?? true,
  showQuickAccess: settings.value?.showQuickAccess ?? true,
  showHistory: settings.value?.showHistory ?? true,
}))

const handleSettingsUpdate = async (updatedSettings: SettingsModel) => {
  settings.value = updatedSettings
  applyTheme(updatedSettings.theme)
  await applyBackground(updatedSettings)
  applyPrimaryColor(updatedSettings.primaryColor || '#667eea')
  applyCustomCss(updatedSettings)
}

onMounted(async () => {
  if (!props.initialSettings) {
    const loadedSettings = await getSettings()
    settings.value = loadedSettings
    applyTheme(loadedSettings.theme)
    await applyBackground(loadedSettings)
    applyPrimaryColor(loadedSettings.primaryColor)
    applyCustomCss(loadedSettings)
  }
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
