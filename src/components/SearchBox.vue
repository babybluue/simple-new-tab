<template>
  <section
    ref="searchBoxRef"
    class="relative z-10 mx-auto w-full max-w-[clamp(320px,72vw,900px)]"
    role="search"
    :aria-label="t('search.siteSearch')"
  >
    <form
      class="border-app bg-app-overlay relative flex items-center rounded-3xl border px-4 py-3 shadow-(--app-shadow-md) ring-2 ring-transparent backdrop-blur-xl transition-all duration-300 focus-within:border-(--app-border-color-hover) focus-within:shadow-(--app-shadow-lg) focus-within:ring-(--app-focus-ring) sm:px-5 sm:py-4"
      role="search"
      @submit.prevent="handleSubmit"
    >
      <div class="relative mr-4 shrink-0">
        <button
          class="flex h-5 cursor-pointer items-center gap-1 rounded px-1 transition-all duration-200"
          type="button"
          :aria-expanded="isEngineMenuOpen"
          aria-haspopup="listbox"
          @click="toggleEngineMenu"
        >
          <img
            v-if="currentEngine"
            :src="currentEngine.icon"
            :alt="currentEngine.name"
            class="h-5 w-5 rounded"
            @error="handleImageError"
          />
          <svg
            v-else
            class="text-app-tertiary h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <svg
            class="text-app-tertiary h-3 w-3 transition-transform duration-200"
            :class="{ 'rotate-180': isEngineMenuOpen }"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div
          v-if="isEngineMenuOpen"
          data-engine-menu
          class="border-app menu-app absolute top-8 left-0 z-500 min-w-[180px] rounded-lg border shadow-(--app-shadow-md) backdrop-blur-xl"
          role="listbox"
          :aria-label="t('search.selectEngine')"
        >
          <button
            v-for="(engine, key) in SEARCH_ENGINES"
            :key="key"
            class="menu-item-app flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left transition-colors duration-200"
            :class="{ 'menu-item-app-active': settings?.searchEngine === key }"
            type="button"
            @click="selectEngine(key)"
          >
            <img :src="engine.icon" :alt="engine.name" class="h-4 w-4 rounded" @error="handleImageError" />
            <span class="text-sm font-medium">{{ engine.name }}</span>
          </button>
        </div>
      </div>
      <div class="relative flex flex-1 items-center">
        <input
          ref="searchInput"
          v-model="query"
          type="text"
          class="text-app placeholder:text-app-tertiary w-full border-none bg-transparent text-base font-normal outline-none md:text-lg"
          :placeholder="t('search.placeholder')"
          autocomplete="off"
          :aria-label="t('search.searchBox')"
          :aria-expanded="isSuggestionListVisible"
          aria-controls="search-suggestions"
          @keydown="handleKeydown"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <div
          v-if="isSuggestionListVisible && suggestions.length > 0"
          id="search-suggestions"
          data-suggestions-menu
          class="border-app menu-app absolute top-full left-0 z-10000 mt-2 w-full rounded-lg border shadow-(--app-shadow-md) backdrop-blur-xl"
          role="listbox"
        >
          <ul>
            <li
              v-for="(suggestion, index) in suggestions"
              :key="index"
              class="menu-item-app flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors duration-200"
              :class="{ 'menu-item-app-active': selectedSuggestionIndex === index }"
              role="option"
              :aria-selected="selectedSuggestionIndex === index"
              @click="selectSuggestion(suggestion)"
              @mouseenter="selectedSuggestionIndex = index"
            >
              <svg
                class="text-app-tertiary h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span class="text-app flex-1 text-sm">{{ suggestion }}</span>
            </li>
          </ul>
        </div>
      </div>
      <button
        v-if="query"
        class="text-app-tertiary hover:text-app bg-app-overlay-hover ml-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0 transition-all duration-200 hover:scale-[1.06]"
        type="button"
        :aria-label="t('search.clearSearch')"
        @click="query = ''"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="h-5 w-5">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </form>
  </section>
</template>
<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { useI18n } from '@/i18n/composable'
import { getSearchSuggestions, performSearch, SEARCH_ENGINES, type SearchEngine } from '@/utils/search'
import { getSettings, saveSettings, type Settings } from '@/utils/storage'

const { t } = useI18n()

const query = ref('')
const settings = ref<Settings | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const searchBoxRef = ref<HTMLElement | null>(null)
const isEngineMenuOpen = ref(false)
const suggestions = ref<string[]>([])
const isSuggestionListVisible = ref(false)
const selectedSuggestionIndex = ref(-1)
let suggestionTimer: ReturnType<typeof setTimeout> | null = null

// 常量
const SUGGESTION_DEBOUNCE_MS = 300
const SUGGESTION_DELAY_MS = 200
const MAX_SUGGESTIONS = 8

const currentEngine = computed<SearchEngine | null>(() => {
  if (!settings.value) return null
  return SEARCH_ENGINES[settings.value.searchEngine] || SEARCH_ENGINES.google
})

onMounted(async () => {
  settings.value = await getSettings()
  // 自动聚焦搜索框
  searchInput.value?.focus()

  // 监听设置变化
  chrome.storage.onChanged.addListener(changes => {
    if (changes.settings) {
      settings.value = (changes.settings.newValue as Settings) || settings.value
    }
  })

  // 点击外部关闭菜单
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (suggestionTimer) {
    clearTimeout(suggestionTimer)
  }
})

const toggleEngineMenu = () => {
  isEngineMenuOpen.value = !isEngineMenuOpen.value
  // 当显示搜索引擎菜单时，关闭搜索建议
  if (isEngineMenuOpen.value) {
    isSuggestionListVisible.value = false
  }
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement

  // 如果点击在搜索框外部，关闭所有菜单
  if (searchBoxRef.value && !searchBoxRef.value.contains(target)) {
    isEngineMenuOpen.value = false
    isSuggestionListVisible.value = false
    return
  }

  // 检查是否点击在菜单或按钮区域内
  const isInsideMenu = target.closest('[data-engine-menu], [data-suggestions-menu], button')
  if (!isInsideMenu) {
    isEngineMenuOpen.value = false
    isSuggestionListVisible.value = false
  }
}

const selectEngine = async (engineKey: string) => {
  if (!settings.value) return
  settings.value.searchEngine = engineKey as Settings['searchEngine']
  await saveSettings(settings.value)
  isEngineMenuOpen.value = false
  // 如果当前有查询，重新获取建议
  if (query.value.trim()) {
    loadSuggestions()
  }
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

const handleInput = () => {
  if (suggestionTimer) {
    clearTimeout(suggestionTimer)
  }
  selectedSuggestionIndex.value = -1
  // 当输入时，关闭搜索引擎菜单
  if (isEngineMenuOpen.value) {
    isEngineMenuOpen.value = false
  }
  if (query.value.trim()) {
    suggestionTimer = setTimeout(() => {
      loadSuggestions()
    }, SUGGESTION_DEBOUNCE_MS)
  } else {
    suggestions.value = []
    isSuggestionListVisible.value = false
  }
}

const handleFocus = () => {
  // 当聚焦搜索框时，关闭搜索引擎菜单
  if (isEngineMenuOpen.value) {
    isEngineMenuOpen.value = false
  }
  if (suggestions.value.length > 0) {
    isSuggestionListVisible.value = true
  }
}

const handleBlur = () => {
  // 延迟关闭，以便点击建议项
  setTimeout(() => {
    isSuggestionListVisible.value = false
  }, SUGGESTION_DELAY_MS)
}

const loadSuggestions = async () => {
  if (!query.value.trim() || !settings.value) {
    suggestions.value = []
    isSuggestionListVisible.value = false
    return
  }
  try {
    const results = await getSearchSuggestions(query.value, settings.value.searchEngine)
    suggestions.value = results.slice(0, MAX_SUGGESTIONS)
    isSuggestionListVisible.value = results.length > 0
  } catch {
    // Failed to load suggestions
    suggestions.value = []
    isSuggestionListVisible.value = false
  }
}

const selectSuggestion = (suggestion: string) => {
  query.value = suggestion
  isSuggestionListVisible.value = false
  handleSearch()
}

const handleSearch = () => {
  if (!query.value.trim() || !settings.value) return
  isSuggestionListVisible.value = false
  performSearch(query.value, settings.value.searchEngine, settings.value.openLinksInNewTab ?? false)
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (selectedSuggestionIndex.value < suggestions.value.length - 1) {
      selectedSuggestionIndex.value++
    } else {
      selectedSuggestionIndex.value = 0
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (selectedSuggestionIndex.value > 0) {
      selectedSuggestionIndex.value--
    } else {
      selectedSuggestionIndex.value = suggestions.value.length - 1
    }
  } else if (e.key === 'Escape') {
    isSuggestionListVisible.value = false
    selectedSuggestionIndex.value = -1
  }
}

const handleSubmit = () => {
  if (selectedSuggestionIndex.value >= 0 && suggestions.value[selectedSuggestionIndex.value]) {
    selectSuggestion(suggestions.value[selectedSuggestionIndex.value])
    return
  }
  handleSearch()
}
</script>
