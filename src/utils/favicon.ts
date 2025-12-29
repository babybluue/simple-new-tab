// Favicon 工具函数

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
 * 获取 Unavatar favicon 服务 URL
 */
export function getUnavatarFavicon(item: FaviconItem): string | undefined {
  const domain = extractDomain(item)
  return domain ? `https://unavatar.io/${domain}` : undefined
}

/**
 * 获取 favicon，按优先级：自定义 > Unavatar > 站点
 */
export function getFavicon(item: FaviconItem): string {
  return item.favicon || getUnavatarFavicon(item) || getSiteFavicon(item) || ''
}

/**
 * 判断一个 favicon 是否属于“自动生成的默认值”（而非用户显式填写的自定义图标 URL）。
 *
 * 目前自动值只来自：
 * - `https://unavatar.io/{domain}`
 * - `https://{domain}/favicon.ico`（以及部分历史数据可能是 http）
 */
export function isAutoFavicon(item: FaviconItem, favicon?: string): boolean {
  const candidate = favicon ?? item.favicon
  if (!candidate) return false

  const domain = extractDomain(item)
  if (!domain) return false

  const unavatar = `https://unavatar.io/${domain}`
  const siteHttps = `https://${domain}/favicon.ico`
  const siteHttp = `http://${domain}/favicon.ico`

  // 兼容未来可能的 querystring（例如 unavatar 的参数）
  if (candidate === unavatar || candidate.startsWith(`${unavatar}?`)) return true
  if (candidate === siteHttps || candidate === siteHttp) return true
  return false
}

/**
 * 处理 favicon 加载错误，尝试回退到站点 favicon
 */
export function handleFaviconError(item: FaviconItem, event: Event, fallbackTried: Record<string, boolean>): void {
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
