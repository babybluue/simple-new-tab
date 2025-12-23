<script lang="ts" setup>
import { onMounted, ref } from 'vue'

import { SEARCH_ENGINES } from '@/utils/search'
import { clearHistory, getSettings, saveSettings, type Settings } from '@/utils/storage'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const settings = ref<Settings>({
  searchEngine: 'google',
  theme: 'auto',
  maxHistoryItems: 10,
})

const loading = ref(false)

onMounted(async () => {
  settings.value = await getSettings()
})

const handleSave = async () => {
  loading.value = true
  try {
    await saveSettings(settings.value)
    // 应用主题
    applyTheme(settings.value.theme)
    emit('close')
  } finally {
    loading.value = false
  }
}

const handleClearHistory = async () => {
  if (confirm('确定要清除所有访问历史吗？')) {
    await clearHistory()
    emit('close')
  }
}

const applyTheme = (theme: string) => {
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.remove('dark')
    root.classList.add('light')
  } else if (theme === 'dark') {
    root.classList.remove('light')
    root.classList.add('dark')
  } else {
    root.classList.remove('light', 'dark')
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="show" class="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm" @click="handleClose">
        <div
          class="fixed top-0 right-0 bottom-0 flex w-full max-w-[420px] flex-col overflow-hidden bg-white/95 shadow-[-4px_0_24px_rgba(0,0,0,0.15)] backdrop-blur-xl dark:bg-[#1e1e1e]/95"
          @click.stop
        >
          <div
            class="flex flex-shrink-0 items-center justify-between border-b border-black/10 p-6 dark:border-white/10"
          >
            <h2 class="m-0 text-xl font-semibold text-gray-900 dark:text-white/90">设置</h2>
            <button
              class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-gray-600 transition-all duration-200 hover:bg-black/5 hover:text-gray-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white/90"
              @click="handleClose"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                class="h-6 w-6"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <div class="mb-6 last:mb-0">
              <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white/90"> 搜索引擎 </label>
              <select
                v-model="settings.searchEngine"
                class="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm text-gray-900 transition-all duration-200 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] dark:border-white/10 dark:bg-white/10 dark:text-white/90"
              >
                <option v-for="(engine, key) in SEARCH_ENGINES" :key="key" :value="key">
                  {{ engine.name }}
                </option>
              </select>
            </div>

            <div class="mb-6 last:mb-0">
              <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white/90"> 主题 </label>
              <select
                v-model="settings.theme"
                class="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm text-gray-900 transition-all duration-200 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] dark:border-white/10 dark:bg-white/10 dark:text-white/90"
              >
                <option value="auto">跟随系统</option>
                <option value="light">浅色</option>
                <option value="dark">深色</option>
              </select>
            </div>

            <div class="mb-6 last:mb-0">
              <label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white/90"> 历史记录数量 </label>
              <input
                v-model.number="settings.maxHistoryItems"
                type="number"
                min="5"
                max="50"
                class="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-sm text-gray-900 transition-all duration-200 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] dark:border-white/10 dark:bg-white/10 dark:text-white/90"
              />
            </div>

            <div class="mb-6 last:mb-0">
              <button
                class="w-full cursor-pointer rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500 transition-all duration-200 hover:border-red-500/30 hover:bg-red-500/15 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-500 dark:hover:border-red-500/30 dark:hover:bg-red-500/15"
                @click="handleClearHistory"
              >
                清除所有历史记录
              </button>
            </div>
          </div>

          <div class="flex flex-shrink-0 gap-3 border-t border-black/10 px-6 py-5 dark:border-white/10">
            <button
              class="flex-1 cursor-pointer rounded-lg border-none bg-black/5 px-4 py-2.5 text-sm font-medium text-gray-900 transition-all duration-200 hover:bg-black/10 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/15"
              @click="handleClose"
            >
              取消
            </button>
            <button
              class="flex-1 cursor-pointer rounded-lg border-none bg-[#667eea] px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#5568d3] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loading"
              @click="handleSave"
            >
              {{ loading ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 抽屉动画 */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-active > div:last-child,
.drawer-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-enter-from > div:last-child,
.drawer-leave-to > div:last-child {
  transform: translateX(100%);
}
</style>
