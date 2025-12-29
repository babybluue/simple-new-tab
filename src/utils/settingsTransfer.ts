import type { Settings } from './storage'
import { DEFAULT_SETTINGS } from './storage'
import type { QuickLink } from './types'

export const SETTINGS_BACKUP_SCHEMA_VERSION = 1 as const

export type SettingsBackupV1 = {
  app: 'Tablite'
  schemaVersion: typeof SETTINGS_BACKUP_SCHEMA_VERSION
  exportedAt: string
  data: {
    settings: Settings
    quickLinks: QuickLink[]
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

const asString = (v: unknown, maxLen = 20000): string | undefined => {
  if (typeof v !== 'string') return undefined
  const s = v.trim()
  if (!s) return ''
  if (s.length > maxLen) return s.slice(0, maxLen)
  return s
}

const asBoolean = (v: unknown): boolean | undefined => (typeof v === 'boolean' ? v : undefined)

const asInt = (v: unknown, min: number, max: number): number | undefined => {
  if (typeof v !== 'number' || !Number.isFinite(v)) return undefined
  const n = Math.trunc(v)
  if (n < min || n > max) return undefined
  return n
}

const oneOf = <T extends string>(v: unknown, allowed: readonly T[]): T | undefined => {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : undefined
}

const isHttpUrl = (url: string): boolean => {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

const isSafeImageDataUrl = (s: string): boolean => {
  // 仅允许图片 dataURL，避免导入奇怪的 data: 内容
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(s)
}

export function buildSettingsBackup(input: { settings: Settings; quickLinks: QuickLink[] }): SettingsBackupV1 {
  return {
    app: 'Tablite',
    schemaVersion: SETTINGS_BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      settings: input.settings,
      quickLinks: input.quickLinks,
    },
  }
}

export type ParseBackupResult =
  | { ok: true; settings: Settings; quickLinks: QuickLink[]; warnings: string[] }
  | { ok: false; error: string }

export function parseAndSanitizeSettingsBackup(jsonText: string): ParseBackupResult {
  let raw: unknown
  try {
    raw = JSON.parse(jsonText)
  } catch {
    return { ok: false, error: 'Invalid JSON' }
  }

  if (!isRecord(raw)) return { ok: false, error: 'Invalid backup format' }
  if (raw.app !== 'Tablite') return { ok: false, error: 'Not a Tablite backup file' }
  if (raw.schemaVersion !== SETTINGS_BACKUP_SCHEMA_VERSION) return { ok: false, error: 'Unsupported backup version' }
  if (!isRecord(raw.data)) return { ok: false, error: 'Invalid backup data' }

  const warnings: string[] = []

  const data = raw.data as Record<string, unknown>
  const rawSettings = data.settings
  const rawQuickLinks = data.quickLinks

  if (!isRecord(rawSettings)) return { ok: false, error: 'Invalid settings in backup' }

  const s = rawSettings as Record<string, unknown>
  const next: Settings = { ...DEFAULT_SETTINGS }

  next.searchEngine = oneOf(s.searchEngine, ['google', 'bing', 'baidu', 'duckduckgo'] as const) ?? next.searchEngine

  // 兼容旧版本：theme 曾允许 'auto'（当前 Settings 类型已移除）
  const themeRaw = oneOf(s.theme, ['light', 'dark', 'auto'] as const)
  if (themeRaw && themeRaw !== 'auto') {
    next.theme = themeRaw
  }
  next.maxHistoryItems = asInt(s.maxHistoryItems, 0, 50) ?? next.maxHistoryItems

  next.backgroundType =
    oneOf(s.backgroundType, ['preset', 'custom', 'bing', 'upload', 'url'] as const) ?? next.backgroundType
  next.backgroundColor = asString(s.backgroundColor, 2000) ?? next.backgroundColor

  const rawBgUrl = asString(s.backgroundImageUrl, 5_000_000)
  next.backgroundImageUrl = rawBgUrl ?? ''

  next.primaryColorType = oneOf(s.primaryColorType, ['preset', 'custom'] as const) ?? next.primaryColorType
  next.primaryColor = asString(s.primaryColor, 2000) ?? next.primaryColor

  next.showDateTime = asBoolean(s.showDateTime) ?? next.showDateTime
  next.showQuickAccess = asBoolean(s.showQuickAccess) ?? next.showQuickAccess
  next.showHistory = asBoolean(s.showHistory) ?? next.showHistory
  next.openLinksInNewTab = asBoolean(s.openLinksInNewTab) ?? next.openLinksInNewTab
  next.iconOnlyLinkCards = asBoolean(s.iconOnlyLinkCards) ?? next.iconOnlyLinkCards
  next.customCssEnabled = asBoolean(s.customCssEnabled) ?? next.customCssEnabled
  next.customCss = asString(s.customCss, 100_000) ?? next.customCss

  const lang = oneOf(s.language, ['zh', 'en'] as const)
  next.language = lang

  // 字段联动/安全修正
  if (next.backgroundType === 'upload') {
    if (!next.backgroundImageUrl || !isSafeImageDataUrl(next.backgroundImageUrl)) {
      warnings.push('Upload background image is missing/invalid; fallback to preset background.')
      next.backgroundType = 'preset'
      next.backgroundImageUrl = ''
    }
  } else if (next.backgroundType === 'bing') {
    // Bing 背景 URL 只允许 http(s)，否则让后续逻辑重新拉取
    if (next.backgroundImageUrl && !isHttpUrl(next.backgroundImageUrl)) {
      warnings.push('Bing background URL is invalid; it will be refreshed.')
      next.backgroundImageUrl = ''
    }
  } else if (next.backgroundType === 'url') {
    // 在线背景 URL：只允许 http(s)，否则回退到 preset
    if (!next.backgroundImageUrl || !isHttpUrl(next.backgroundImageUrl)) {
      warnings.push('Online background URL is missing/invalid; fallback to preset background.')
      next.backgroundType = 'preset'
      next.backgroundImageUrl = ''
    }
  } else {
    next.backgroundImageUrl = ''
  }

  if (!Array.isArray(rawQuickLinks)) {
    return { ok: true, settings: next, quickLinks: [], warnings }
  }

  const sanitizedLinks: QuickLink[] = []
  let skipped = 0

  for (const item of rawQuickLinks) {
    if (!isRecord(item)) {
      skipped++
      continue
    }
    const r = item as Record<string, unknown>
    const url = asString(r.url, 4000)
    if (!url || !isHttpUrl(url)) {
      skipped++
      continue
    }

    const titleRaw = asString(r.title, 120)
    const title =
      titleRaw && titleRaw.trim()
        ? titleRaw.trim()
        : (() => {
            try {
              return new URL(url).hostname
            } catch {
              return url
            }
          })()

    const faviconRaw = asString(r.favicon, 4000)
    const favicon = faviconRaw && (isHttpUrl(faviconRaw) || isSafeImageDataUrl(faviconRaw)) ? faviconRaw : undefined

    const categoryRaw = asString(r.category, 30)
    const category = categoryRaw && categoryRaw.trim() ? categoryRaw.trim() : undefined

    sanitizedLinks.push({ title, url, ...(favicon ? { favicon } : {}), ...(category ? { category } : {}) })
    if (sanitizedLinks.length >= 30) break
  }

  if (skipped > 0) warnings.push(`Skipped ${skipped} invalid quick link(s).`)

  return { ok: true, settings: next, quickLinks: sanitizedLinks, warnings }
}
