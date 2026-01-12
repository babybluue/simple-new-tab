// 存储工具函数
import { getUnavatarFavicon, isAutoFavicon } from './favicon'
import { tryGetLogoForUrl } from './logo'
import { PRESET_QUICK_LINKS } from './presets'
import {
  getSystemPrefersDark,
  getThemeDefaults,
  THEME_DARK_BG,
  THEME_DARK_PRIMARY,
  THEME_LIGHT_BG,
  THEME_LIGHT_PRIMARY,
} from './theme'
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

export type BackgroundType = 'preset' | 'custom' | 'bing' | 'upload' | 'url'
export type PrimaryColorType = 'preset' | 'custom'

export interface Settings {
  searchEngine: 'google' | 'bing' | 'baidu' | 'duckduckgo'
  theme: 'light' | 'dark' | 'auto'
  maxHistoryItems: number
  backgroundType: BackgroundType
  backgroundColor: string
  /** 背景色透明度（0~1）；仅对纯色背景生效（gradient 背景不做解析） */
  backgroundOpacity: number
  backgroundImageUrl?: string
  primaryColorType: PrimaryColorType
  primaryColor: string
  /** 主色透明度（0~1） */
  primaryOpacity: number
  showDateTime: boolean
  showQuickAccess: boolean
  showHistory: boolean
  /** 点击 LinkCard 时在新标签页打开链接 */
  openLinksInNewTab: boolean
  /** LinkCard 仅显示图标（隐藏标题/副标题） */
  iconOnlyLinkCards: boolean
  /** 是否启用用户自定义 CSS */
  customCssEnabled: boolean
  /** 用户自定义 CSS 文本 */
  customCss: string
  language?: 'zh_CN' | 'zh_TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru'
  /** 是否显示农历日期（仅在简中或繁中时可用） */
  showLunarCalendar: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  searchEngine: 'google',
  theme: 'auto',
  maxHistoryItems: 10,
  backgroundType: 'preset',
  // 默认背景色和主色会在 getSettings() 中根据系统主题动态设置
  backgroundColor: THEME_LIGHT_BG,
  backgroundOpacity: 1,
  backgroundImageUrl: '',
  primaryColorType: 'preset',
  primaryColor: THEME_LIGHT_PRIMARY,
  primaryOpacity: 1,
  showDateTime: true,
  showQuickAccess: true,
  showHistory: true,
  openLinksInNewTab: false,
  iconOnlyLinkCards: false,
  customCssEnabled: false,
  customCss: '',
  language: undefined, // 默认根据浏览器语言自动选择
  showLunarCalendar: false,
}

// 常量
const MAX_QUICK_LINKS = 30
const DEFAULT_OPACITY = 1
const DEFAULT_VISIT_COUNT = 1

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
    const { title, url, logo, favicon, domain, category } = link
    return { title, url, logo, favicon, domain, category }
  })

  return defaultsFromPresets.length ? defaultsFromPresets : FALLBACK_DEFAULT_QUICK_LINKS
})()

const normalizeHistoryItem = (item: HistoryItem): HistoryItem => {
  const domain = item.domain || extractDomainFromUrl(item.url)
  const visitCount = item.visitCount ?? DEFAULT_VISIT_COUNT
  const timestamp = item.timestamp || Date.now()

  return { ...item, domain, visitCount, timestamp }
}

const normalizeQuickLink = (link: QuickLink): QuickLink => {
  const domain = link.domain || extractDomainFromUrl(link.url)

  // 给"用户自定义链接"补齐可用的内置 logo（仅在确实存在对应 svg 时才写入；不回退 generic）。
  const logo = link.logo || tryGetLogoForUrl(link.url)

  let favicon = link.favicon
  // 如果使用本地 favicon，清除自动生成的 favicon URL
  if (link.useLocalFavicon) {
    if (favicon && isAutoFavicon({ domain, url: link.url }, favicon)) {
      favicon = undefined
    }
  } else if (logo) {
    // 有本地 logo：不持久化"自动生成的在线 favicon"（避免编辑回显一堆链接）。
    if (favicon && isAutoFavicon({ domain, url: link.url }, favicon)) {
      favicon = undefined
    }
  } else {
    // 没有本地 logo：保持"在线获取"的初衷 —— 默认补齐 unavatar，且允许它继续持久化，
    // 这样编辑时也能看到/修改这个 URL。
    favicon = favicon || getUnavatarFavicon({ domain, url: link.url })
  }

  const next: QuickLink = { ...link, domain }
  if (logo) next.logo = logo
  if (favicon) next.favicon = favicon
  else delete (next as Partial<QuickLink>).favicon
  // 保留 useLocalFavicon 设置
  if (link.useLocalFavicon) next.useLocalFavicon = true
  else delete (next as Partial<QuickLink>).useLocalFavicon
  return next
}

const sortHistory = (items: HistoryItem[]): HistoryItem[] => {
  return [...items].sort((a, b) => {
    const countDiff = (b.visitCount ?? DEFAULT_VISIT_COUNT) - (a.visitCount ?? DEFAULT_VISIT_COUNT)
    if (countDiff !== 0) return countDiff
    return (b.timestamp || 0) - (a.timestamp || 0)
  })
}

// 获取设置
export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.local.get('settings')
  const stored = result?.settings as Partial<Settings> | undefined

  // 获取当前系统主题偏好和对应的默认颜色
  const prefersDark = getSystemPrefersDark()
  const systemDefaults = getThemeDefaults('auto', prefersDark)

  // 如果是首次加载（没有存储的设置），根据系统偏好设置默认背景和主色
  if (!stored) {
    return {
      ...DEFAULT_SETTINGS,
      backgroundColor: systemDefaults.backgroundColor,
      primaryColor: systemDefaults.primaryColor,
    }
  }

  // 合并存储的设置，确保所有字段都有默认值
  // 使用展开运算符合并，这样新增的字段会自动使用默认值
  const merged: Settings = { ...DEFAULT_SETTINGS, ...stored }

  // 验证和修正关键字段的类型和值，确保数据安全
  // 枚举类型字段：验证值是否在允许的范围内
  if (!['google', 'bing', 'baidu', 'duckduckgo'].includes(merged.searchEngine)) {
    merged.searchEngine = DEFAULT_SETTINGS.searchEngine
  }
  if (!['light', 'dark', 'auto'].includes(merged.theme)) {
    merged.theme = DEFAULT_SETTINGS.theme
  }
  if (typeof merged.maxHistoryItems !== 'number' || merged.maxHistoryItems < 0 || merged.maxHistoryItems > 50) {
    merged.maxHistoryItems = DEFAULT_SETTINGS.maxHistoryItems
  }
  if (!['preset', 'custom', 'bing', 'upload', 'url'].includes(merged.backgroundType)) {
    merged.backgroundType = DEFAULT_SETTINGS.backgroundType
  }
  if (typeof merged.backgroundColor !== 'string') {
    merged.backgroundColor = DEFAULT_SETTINGS.backgroundColor
  }
  if (typeof merged.backgroundOpacity !== 'number' || merged.backgroundOpacity < 0 || merged.backgroundOpacity > 1) {
    merged.backgroundOpacity = DEFAULT_SETTINGS.backgroundOpacity
  }
  if (merged.backgroundImageUrl !== undefined && typeof merged.backgroundImageUrl !== 'string') {
    merged.backgroundImageUrl = DEFAULT_SETTINGS.backgroundImageUrl
  }
  if (!['preset', 'custom'].includes(merged.primaryColorType)) {
    merged.primaryColorType = DEFAULT_SETTINGS.primaryColorType
  }
  if (typeof merged.primaryColor !== 'string') {
    merged.primaryColor = DEFAULT_SETTINGS.primaryColor
  }
  if (typeof merged.primaryOpacity !== 'number' || merged.primaryOpacity < 0 || merged.primaryOpacity > 1) {
    merged.primaryOpacity = DEFAULT_SETTINGS.primaryOpacity
  }
  if (typeof merged.showDateTime !== 'boolean') {
    merged.showDateTime = DEFAULT_SETTINGS.showDateTime
  }
  if (typeof merged.showQuickAccess !== 'boolean') {
    merged.showQuickAccess = DEFAULT_SETTINGS.showQuickAccess
  }
  if (typeof merged.showHistory !== 'boolean') {
    merged.showHistory = DEFAULT_SETTINGS.showHistory
  }
  if (typeof merged.openLinksInNewTab !== 'boolean') {
    merged.openLinksInNewTab = DEFAULT_SETTINGS.openLinksInNewTab
  }
  if (typeof merged.iconOnlyLinkCards !== 'boolean') {
    merged.iconOnlyLinkCards = DEFAULT_SETTINGS.iconOnlyLinkCards
  }
  if (typeof merged.customCssEnabled !== 'boolean') {
    merged.customCssEnabled = DEFAULT_SETTINGS.customCssEnabled
  }
  if (typeof merged.customCss !== 'string') {
    merged.customCss = DEFAULT_SETTINGS.customCss
  }
  if (
    merged.language !== undefined &&
    !['zh_CN', 'zh_TW', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'ru'].includes(merged.language)
  ) {
    merged.language = DEFAULT_SETTINGS.language
  }
  if (typeof merged.showLunarCalendar !== 'boolean') {
    merged.showLunarCalendar = DEFAULT_SETTINGS.showLunarCalendar
  }

  // 向后兼容：将旧的 'zh' 映射到 'zh_CN'
  if (merged.language === ('zh' as any)) {
    merged.language = 'zh_CN'
  }

  // 旧版本数据迁移
  migrateOldSettings(merged, systemDefaults)

  return merged
}

/**
 * 旧版本数据迁移逻辑
 * 将旧的默认值更新为新的系统主题对应的颜色
 */
function migrateOldSettings(
  settings: Settings,
  systemDefaults: { backgroundColor: string; primaryColor: string }
): void {
  const OLD_DEFAULT_BG = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
  const OLD_DEFAULT_PRIMARY = '#667eea'

  // 如果背景色是旧的默认渐变值，更新为系统主题对应的背景色
  if (settings.backgroundColor === OLD_DEFAULT_BG) {
    settings.backgroundColor = systemDefaults.backgroundColor
    settings.backgroundType = 'preset'
  }

  // 如果主色是旧的默认值，更新为系统主题对应的主色
  if (settings.primaryColor === OLD_DEFAULT_PRIMARY) {
    settings.primaryColor = systemDefaults.primaryColor
    settings.primaryColorType = 'preset'
  }

  // 迁移：历史版本把"主色 preset"错误地设成了主题背景色（THEME_LIGHT_BG/THEME_DARK_BG），
  // 导致深色模式下部分 logo/边框对比度不足。
  // 这里仅在"主色=背景且主色属于主题背景常量"时自动纠正为主题主色常量
  const themePrimaryForSetting = getThemeDefaults(settings.theme).primaryColor
  const isThemeBgConstant = (v: string) => v === THEME_LIGHT_BG || v === THEME_DARK_BG

  if (
    settings.primaryColorType === 'preset' &&
    settings.primaryColor &&
    settings.backgroundColor &&
    settings.primaryColor === settings.backgroundColor &&
    isThemeBgConstant(settings.primaryColor)
  ) {
    settings.primaryColor = themePrimaryForSetting
  }
}

// 保存设置
export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ settings })
}

// 获取访问历史
export async function getHistory(): Promise<HistoryItem[]> {
  const result = await chrome.storage.local.get('history')
  const rawHistory = (result?.history || []) as HistoryItem[]
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
  const stored = (result?.quickLinks || []) as QuickLink[]
  const normalized = (stored.length > 0 ? stored : DEFAULT_QUICK_LINKS).map(normalizeQuickLink)

  // 如果之前没有存储，初始化存储默认列表，方便后续同步
  if (!stored.length) {
    await chrome.storage.local.set({ quickLinks: normalized })
  } else {
    // 轻量迁移：如果 normalizeQuickLink 清理/补齐了字段（例如去掉自动 favicon、补齐 domain、补齐可用本地 logo），
    // 则把结果写回存储，保证“存储层”和“渲染层/编辑层”一致。
    const changed = stored.some((prev, idx) => {
      const next = normalized[idx]
      if (!next) return true
      return (
        prev.url !== next.url ||
        prev.title !== next.title ||
        prev.domain !== next.domain ||
        prev.logo !== next.logo ||
        prev.favicon !== next.favicon ||
        prev.category !== next.category
      )
    })
    if (changed) {
      await chrome.storage.local.set({ quickLinks: normalized })
    }
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

  const limited = updated.slice(0, MAX_QUICK_LINKS)
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
