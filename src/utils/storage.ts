// 存储工具函数
export interface HistoryItem {
  url: string
  title: string
  favicon?: string
  timestamp: number
  domain?: string
  visitCount?: number
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

const extractDomain = (url: string): string => {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`
    return new URL(normalized).hostname || url
  } catch {
    return url
  }
}

const normalizeHistoryItem = (item: HistoryItem): HistoryItem => {
  const domain = item.domain || extractDomain(item.url)
  const visitCount = item.visitCount ?? 1
  const timestamp = item.timestamp || Date.now()

  return { ...item, domain, visitCount, timestamp }
}

const sortHistory = (items: HistoryItem[]): HistoryItem[] => {
  return [...items].sort((a, b) => {
    const countDiff = (b.visitCount ?? 1) - (a.visitCount ?? 1)
    if (countDiff !== 0) return countDiff
    return (b.timestamp || 0) - (a.timestamp || 0)
  })
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
  const rawHistory = (result.history || []) as HistoryItem[]
  return sortHistory(rawHistory.map(normalizeHistoryItem))
}

// 添加访问历史
export async function addHistory(item: HistoryItem): Promise<void> {
  const settings = await getSettings()
  const history = await getHistory()
  const normalizedInput = normalizeHistoryItem({ ...item, timestamp: Date.now() })

  const existingIndex = history.findIndex(h => h.domain === normalizedInput.domain)

  let updatedHistory: HistoryItem[]

  if (existingIndex !== -1) {
    const existing = history[existingIndex]
    const merged: HistoryItem = {
      ...existing,
      ...normalizedInput,
      visitCount: (existing.visitCount ?? 1) + 1,
      timestamp: Date.now(),
    }
    history.splice(existingIndex, 1)
    updatedHistory = [merged, ...history]
  } else {
    const newItem: HistoryItem = {
      ...normalizedInput,
      visitCount: 1,
      timestamp: Date.now(),
    }
    updatedHistory = [newItem, ...history]
  }

  const limited = sortHistory(updatedHistory).slice(0, settings.maxHistoryItems)

  await chrome.storage.local.set({ history: limited })
}

// 清除历史记录
export async function clearHistory(): Promise<void> {
  await chrome.storage.local.set({ history: [] })
}

// 删除单个历史记录
export async function removeHistoryItem(url: string): Promise<void> {
  const domain = extractDomain(url)
  const history = await getHistory()
  const filtered = history.filter(h => h.domain !== domain && h.url !== url)
  await chrome.storage.local.set({ history: filtered })
}
