// URL 工具函数

const HTTP_PREFIX = 'http'
const HTTPS_PREFIX = 'https'
const WWW_PREFIX = 'www.'

/**
 * 从 URL 字符串提取域名
 */
export function extractDomainFromUrl(url: string): string {
  try {
    const normalizedUrl = url.startsWith(HTTP_PREFIX) ? url : `${HTTPS_PREFIX}://${url}`
    return new URL(normalizedUrl).hostname
  } catch {
    return url
  }
}

/**
 * 提取主域名（不考虑子域名）
 * 例如：www.example.com -> example.com, subdomain.example.com -> example.com
 */
export function extractRootDomain(hostname: string): string {
  if (!hostname) return hostname

  // 移除 www. 前缀
  let domain = hostname.replace(new RegExp(`^${WWW_PREFIX}`, 'i'), '')

  // 按点分割
  const parts = domain.split('.')

  // 如果只有一部分，直接返回
  if (parts.length <= 1) return domain

  // 常见的二级顶级域名（需要保留最后三部分）
  const secondLevelTlds = ['co.uk', 'com.cn', 'com.au', 'co.jp', 'com.br', 'co.za', 'com.mx']
  const lastTwoParts = parts.slice(-2).join('.')
  const lastThreeParts = parts.slice(-3).join('.')

  // 检查是否是二级顶级域名
  for (const tld of secondLevelTlds) {
    if (domain.endsWith(`.${tld}`) || domain === tld) {
      return lastThreeParts
    }
  }

  // 默认返回最后两部分（主域名）
  return lastTwoParts
}

/**
 * 从 URL 提取标题（使用域名）
 */
export function getTitleFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(new RegExp(`^${WWW_PREFIX}`, 'i'), '')
    return host || url
  } catch {
    return url
  }
}
