// 存储工具函数
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
}

export interface QuickLink {
  title: string
  url: string
  favicon?: string
  domain?: string
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
}

export const PRESET_QUICK_LINKS: QuickLink[] = [
  { title: 'Github', url: 'https://github.com' },
  { title: 'X', url: 'https://x.com' },
  { title: '微博', url: 'https://weibo.com' },
  { title: '小红书', url: 'https://www.xiaohongshu.com' },
  { title: '淘宝', url: 'https://www.taobao.com' },
  { title: '京东', url: 'https://www.jd.com' },
  { title: '哔哩哔哩', url: 'https://www.bilibili.com' },
  { title: 'Youtube', url: 'https://www.youtube.com' },
]

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

const normalizeQuickLink = (link: QuickLink): QuickLink => {
  const domain = link.domain || extractDomain(link.url)
  const googleFavicon = domain
    ? `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=64`
    : undefined
  const favicon = link.favicon || googleFavicon
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
  return { ...DEFAULT_SETTINGS, ...(stored || {}) }
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

// 获取快速访问列表
export async function getQuickLinks(): Promise<QuickLink[]> {
  const result = await chrome.storage.local.get('quickLinks')
  const stored = (result.quickLinks || []) as QuickLink[]
  const normalized = (stored.length > 0 ? stored : PRESET_QUICK_LINKS).map(normalizeQuickLink)

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
  const domain = extractDomain(url)
  const links = await getQuickLinks()
  const filtered = links.filter(link => link.domain !== domain && link.url !== url)
  await saveQuickLinks(filtered)
  return filtered
}
