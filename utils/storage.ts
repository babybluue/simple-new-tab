// 存储工具函数
export interface HistoryItem {
  url: string
  title: string
  favicon?: string
  timestamp: number
}

export interface Settings {
  searchEngine: 'google' | 'bing' | 'baidu' | 'duckduckgo'
  theme: 'light' | 'dark' | 'auto'
  maxHistoryItems: number
}

const DEFAULT_SETTINGS: Settings = {
  searchEngine: 'google',
  theme: 'auto',
  maxHistoryItems: 10,
}

// 获取设置
export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get('settings')
  return result.settings || DEFAULT_SETTINGS
}

// 保存设置
export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ settings })
}

// 获取访问历史
export async function getHistory(): Promise<HistoryItem[]> {
  const result = await chrome.storage.local.get('history')
  return result.history || []
}

// 添加访问历史
export async function addHistory(item: HistoryItem): Promise<void> {
  const history = await getHistory()
  const settings = await getSettings()

  // 移除重复项（相同 URL）
  const filtered = history.filter(h => h.url !== item.url)

  // 添加到开头
  filtered.unshift(item)

  // 限制数量
  const limited = filtered.slice(0, settings.maxHistoryItems)

  await chrome.storage.local.set({ history: limited })
}

// 清除历史记录
export async function clearHistory(): Promise<void> {
  await chrome.storage.local.set({ history: [] })
}

// 删除单个历史记录
export async function removeHistoryItem(url: string): Promise<void> {
  const history = await getHistory()
  const filtered = history.filter(h => h.url !== url)
  await chrome.storage.local.set({ history: filtered })
}
