// 存储工具函数
import { getUnavatarFavicon } from './favicon'
import { PRESET_QUICK_LINKS } from './presets'
import { THEME_DARK_BG, THEME_LIGHT_BG } from './theme'
import type { QuickLink } from './types'
import { extractDomainFromUrl } from './url'

export interface HistoryItem {
  url: string
  title: string
  favicon?: string
  timestamp: number
  domain?: string
  visitCount?: number
}

export type BackgroundType = 'preset' | 'custom' | 'bing' | 'upload'
export type PrimaryColorType = 'preset' | 'custom'

export interface Settings {
  searchEngine: 'google' | 'bing' | 'baidu' | 'duckduckgo'
  theme: 'light' | 'dark' | 'auto'
  maxHistoryItems: number
  backgroundType: BackgroundType
  backgroundColor: string
  backgroundImageUrl?: string
  primaryColorType: PrimaryColorType
  primaryColor: string
  showDateTime: boolean
  showQuickAccess: boolean
  showHistory: boolean
  /** 点击 LinkCard 时在新标签页打开链接 */
  openLinksInNewTab: boolean
  /** LinkCard 仅显示图标（隐藏标题/副标题） */
  iconOnlyLinkCards: boolean
  language?: 'zh' | 'en'
}

export const DEFAULT_SETTINGS: Settings = {
  searchEngine: 'google',
  theme: 'auto',
  maxHistoryItems: 10,
  backgroundType: 'preset',
  backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  backgroundImageUrl: '',
  primaryColorType: 'preset',
  primaryColor: '#667eea',
  showDateTime: true,
  showQuickAccess: true,
  showHistory: true,
  openLinksInNewTab: false,
  iconOnlyLinkCards: false,
  language: undefined, // 默认根据浏览器语言自动选择
}

const FALLBACK_DEFAULT_QUICK_LINKS: QuickLink[] = [
  { title: 'Google', url: 'https://www.google.com' },
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'YouTube', url: 'https://www.youtube.com' },
  { title: 'Stack Overflow', url: 'https://stackoverflow.com' },
]

export const DEFAULT_QUICK_LINKS: QuickLink[] = (() => {
  // 默认快速访问站点来自预设模板中标记了 default: true 的条目
  const defaultsFromPresets = PRESET_QUICK_LINKS.filter(link => link.default).map(link => {
    // 不把 default 字段写入 quickLinks 存储，避免后续把它当成“用户自定义字段”
    const { title, url, favicon, domain, category } = link
    return { title, url, favicon, domain, category }
  })

  return defaultsFromPresets.length ? defaultsFromPresets : FALLBACK_DEFAULT_QUICK_LINKS
})()

const normalizeHistoryItem = (item: HistoryItem): HistoryItem => {
  const domain = item.domain || extractDomainFromUrl(item.url)
  const visitCount = item.visitCount ?? 1
  const timestamp = item.timestamp || Date.now()

  return { ...item, domain, visitCount, timestamp }
}

const normalizeQuickLink = (link: QuickLink): QuickLink => {
  const domain = link.domain || extractDomainFromUrl(link.url)
  const unavatarFavicon = getUnavatarFavicon({ domain, url: link.url })
  const favicon = link.favicon || unavatarFavicon
  return { ...link, domain, favicon }
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
  const stored = result.settings as Partial<Settings> | undefined

  // 如果是首次加载（没有存储的设置），根据系统偏好设置默认背景
  if (!stored) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const defaultBg = prefersDark ? THEME_DARK_BG : THEME_LIGHT_BG
    return { ...DEFAULT_SETTINGS, backgroundColor: defaultBg }
  }

  return { ...DEFAULT_SETTINGS, ...stored }
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
  const domain = extractDomainFromUrl(url)
  const history = await getHistory()
  const filtered = history.filter(h => h.domain !== domain && h.url !== url)
  await chrome.storage.local.set({ history: filtered })
}

// 获取快速访问列表
export async function getQuickLinks(): Promise<QuickLink[]> {
  const result = await chrome.storage.local.get('quickLinks')
  const stored = (result.quickLinks || []) as QuickLink[]
  const normalized = (stored.length > 0 ? stored : DEFAULT_QUICK_LINKS).map(normalizeQuickLink)

  // 如果之前没有存储，初始化存储默认列表，方便后续同步
  if (!stored.length) {
    await chrome.storage.local.set({ quickLinks: normalized })
  }

  return normalized
}

// 保存快速访问列表
export async function saveQuickLinks(links: QuickLink[]): Promise<void> {
  const normalized = links.map(normalizeQuickLink)
  await chrome.storage.local.set({ quickLinks: normalized })
}

// 新增或更新快速访问站点（以域名/URL 去重）
export async function addQuickLink(link: QuickLink): Promise<QuickLink[]> {
  const links = await getQuickLinks()
  const normalized = normalizeQuickLink(link)
  const existingIndex = links.findIndex(item => item.domain === normalized.domain || item.url === normalized.url)

  let updated: QuickLink[]
  if (existingIndex !== -1) {
    updated = [...links]
    updated[existingIndex] = { ...links[existingIndex], ...normalized }
  } else {
    updated = [normalized, ...links]
  }

  const limited = updated.slice(0, 30)
  await saveQuickLinks(limited)
  return limited
}

// 删除快速访问站点
export async function removeQuickLink(url: string): Promise<QuickLink[]> {
  const domain = extractDomainFromUrl(url)
  const links = await getQuickLinks()
  const filtered = links.filter(link => link.domain !== domain && link.url !== url)
  await saveQuickLinks(filtered)
  return filtered
}
