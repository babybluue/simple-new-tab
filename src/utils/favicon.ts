// Favicon 工具函数
import type { HistoryItem } from './storage'
import type { QuickLink } from './types'

export interface FaviconItem {
  domain?: string
  url: string
  favicon?: string
}

/**
 * 从 URL 或 domain 提取域名
 */
export function extractDomain(item: FaviconItem | string): string | null {
  const target = typeof item === 'string' ? item : item.domain || item.url
  try {
    const urlObj = new URL(target.startsWith('http') ? target : `https://${target}`)
    return urlObj.hostname
  } catch {
    return null
  }
}

/**
 * 获取站点 favicon URL
 */
export function getSiteFavicon(item: FaviconItem): string | undefined {
  const domain = extractDomain(item)
  return domain ? `https://${domain}/favicon.ico` : undefined
}

/**
 * 获取 Google favicon 服务 URL
 */
export function getGoogleFavicon(item: FaviconItem): string | undefined {
  const domain = extractDomain(item)
  return domain
    ? `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=64`
    : undefined
}

/**
 * 获取 favicon，按优先级：自定义 > Google > 站点
 */
export function getFavicon(item: FaviconItem): string {
  return item.favicon || getGoogleFavicon(item) || getSiteFavicon(item) || ''
}

/**
 * 处理 favicon 加载错误，尝试回退到站点 favicon
 */
export function handleFaviconError(
  item: FaviconItem,
  event: Event,
  fallbackTried: Record<string, boolean>
): void {
  const img = event.target as HTMLImageElement
  const key = item.domain || item.url

  if (fallbackTried[key]) {
    img.style.display = 'none'
    return
  }

  const site = getSiteFavicon(item)
  if (site && img.src !== site) {
    fallbackTried[key] = true
    img.src = site
    return
  }

  fallbackTried[key] = true
  img.style.display = 'none'
}

