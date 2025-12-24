<template>
  <div class="relative flex min-h-screen w-full flex-col items-center px-6 py-12 md:px-5 md:py-8">
    <Settings :initial-settings="initialSettings" />
    <DateTime />

    <div class="mt-6 mb-8 w-full md:mb-6">
      <SearchBox />
    </div>
    <QuickAccessList />
    <HistoryList />
  </div>
</template>
<script lang="ts" setup>
import { onMounted } from 'vue'

import DateTime from '@/components/DateTime.vue'
import HistoryList from '@/components/HistoryList.vue'
import QuickAccessList from '@/components/QuickAccessList.vue'
import SearchBox from '@/components/SearchBox.vue'
import Settings from '@/components/Settings.vue'
import { getSettings, type Settings as SettingsModel } from '@/utils/storage'
import { applyBackground, applyPrimaryColor, applyTheme } from '@/utils/theme'

const props = defineProps<{ initialSettings?: SettingsModel }>()
const initialSettings = props.initialSettings

onMounted(async () => {
  if (!props.initialSettings) {
    const settings = await getSettings()
    applyTheme(settings.theme)
    await applyBackground(settings)
    applyPrimaryColor(settings.primaryColor)
  }
})
</script>
