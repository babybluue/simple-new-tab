// Favicon 工具函数

export interface FaviconItem {
  domain?: string
  url: string
  favicon?: string
  /** 是否使用本地缓存的 favicon（单个链接设置） */
  useLocalFavicon?: boolean
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
 * 检测是否为本地/内网地址
 * 本地地址包括：localhost、127.x.x.x、10.x.x.x、172.16-31.x.x、192.168.x.x、[::1]、file:// 等
 */
export function isLocalAddress(item: FaviconItem | string): boolean {
  const target = typeof item === 'string' ? item : item.domain || item.url

  // 处理 file:// 协议
  if (target.startsWith('file://')) return true

  const domain = extractDomain(item)
  if (!domain) return false

  // localhost 或 localhost.localdomain
  if (domain === 'localhost' || domain.endsWith('.localhost')) return true

  // IPv6 loopback
  if (domain === '[::1]' || domain === '::1') return true

  // IPv4 地址检测
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  const match = domain.match(ipv4Regex)
  if (match) {
    const [, a, b] = match.map(Number)
    // 127.x.x.x (loopback)
    if (a === 127) return true
    // 10.x.x.x (private class A)
    if (a === 10) return true
    // 172.16.x.x - 172.31.x.x (private class B)
    if (a === 172 && b >= 16 && b <= 31) return true
    // 192.168.x.x (private class C)
    if (a === 192 && b === 168) return true
    // 169.254.x.x (link-local)
    if (a === 169 && b === 254) return true
    // 0.0.0.0
    if (a === 0 && b === 0) return true
  }

  // 常见的本地开发域名后缀
  if (domain.endsWith('.local') || domain.endsWith('.test') || domain.endsWith('.dev.local')) return true

  return false
}

/**
 * 获取 Chrome 浏览器缓存的 favicon URL
 * 使用 Chrome 扩展的 _favicon API，可以获取用户访问过的网站的缓存图标
 * @param url 网站 URL
 * @param size 图标大小，默认 32
 */
export function getChromeCachedFavicon(url: string, size: number = 32): string {
  // Chrome 扩展的 _favicon API
  // 需要在 manifest 中声明 "favicon" 权限
  return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=${size}`
}

/**
 * 获取站点 favicon URL
 * 对于本地地址，使用 Chrome 缓存的 favicon
 */
export function getSiteFavicon(item: FaviconItem): string | undefined {
  const domain = extractDomain(item)
  if (!domain) return undefined

  // 对于本地地址，使用 Chrome 缓存的 favicon
  if (isLocalAddress(item)) {
    const target = typeof item === 'string' ? item : item.url
    return getChromeCachedFavicon(target)
  }

  return `https://${domain}/favicon.ico`
}

/**
 * 获取 Unavatar favicon 服务 URL
 * 对于本地/内网地址，返回 undefined（在线服务无法访问本地地址）
 */
export function getUnavatarFavicon(item: FaviconItem): string | undefined {
  // 本地地址不使用在线服务
  if (isLocalAddress(item)) return undefined

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
 * 根据设置获取 favicon URL
 * @param item Favicon 项
 * @param globalUseLocalFavicon 是否使用本地 favicon（已废弃，保留用于向后兼容）
 * @returns favicon URL
 */
export function getFaviconWithSettings(item: FaviconItem, globalUseLocalFavicon: boolean = false): string | undefined {
  // 如果有自定义 favicon，直接使用
  if (item.favicon && !isAutoFavicon(item, item.favicon)) {
    return item.favicon
  }

  // 检查是否应该使用本地 favicon（优先使用单个链接的设置）
  const shouldUseLocal = item.useLocalFavicon ?? globalUseLocalFavicon

  if (shouldUseLocal || isLocalAddress(item)) {
    // 使用 Chrome 缓存的 favicon
    return getChromeCachedFavicon(item.url)
  }

  // 使用在线服务
  return getUnavatarFavicon(item) || getSiteFavicon(item)
}

/**
 * 判断一个 favicon 是否属于"自动生成的默认值"（而非用户显式填写的自定义图标 URL）。
 *
 * 目前自动值只来自：
 * - `https://unavatar.io/{domain}`
 * - `https://{domain}/favicon.ico`（以及部分历史数据可能是 http）
 * - Chrome 缓存的 favicon（chrome-extension://.../_favicon/...）
 */
export function isAutoFavicon(item: FaviconItem, favicon?: string): boolean {
  const candidate = favicon ?? item.favicon
  if (!candidate) return false

  // Chrome 缓存的 favicon
  if (candidate.includes('/_favicon/?pageUrl=')) return true

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
