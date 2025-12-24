<template>
  <button
    class="absolute top-6 right-6 flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-white/90 shadow-lg backdrop-blur-lg transition-all duration-300 hover:scale-110 hover:rotate-90 hover:bg-white/25 hover:text-white hover:shadow-xl md:top-5 md:right-5 md:h-11 md:w-11 dark:border-white/30 dark:bg-white/85 dark:text-[#213547]/80 dark:hover:bg-white/95 dark:hover:text-[#213547]/95"
    title="设置"
    @click="openSettings"
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  </button>

  <SettingsModal :show="showSettings" @close="closeSettings" />
</template>
<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'

import SettingsModal from './SettingsModal.vue'

const showSettings = ref(false)

const openSettings = () => {
  showSettings.value = true
}

const closeSettings = () => {
  showSettings.value = false
}
</script>
