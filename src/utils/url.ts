// URL 工具函数

/**
 * 从 URL 字符串提取域名
 */
export function extractDomainFromUrl(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname
  } catch {
    return url
  }
}

/**
 * 从 URL 提取标题（使用域名）
 */
export function getTitleFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return host || url
  } catch {
    return url
  }
}
