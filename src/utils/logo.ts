import { extractDomainFromUrl, extractRootDomain } from './url'

// 所有本地 logo（构建时打包为静态资源 URL）
const LOGOS = import.meta.glob('../assets/logo/*.svg', {
  eager: true,
  import: 'default',
}) as Record<string, string>

/**
 * 最简单匹配规则（URL -> logo SVG 文件名）：
 * - 取 hostname（例如 https://www.google.com -> www.google.com）
 * - 转小写
 * - 只保留 [a-z0-9._-]，其它字符替换为 _
 * - logo 文件命名为：`${hostname}.svg`
 */
export function logoFileKeyFromUrl(url: string): string {
  const hostname = extractDomainFromUrl(url)
  return hostname.toLowerCase().replace(/[^a-z0-9._-]/g, '_')
}

export function getLogoForUrl(url: string): string {
  const key = logoFileKeyFromUrl(url)
  const rel = `../assets/logo/${key}.svg`
  return LOGOS[rel] || LOGOS['../assets/logo/generic.svg'] || ''
}

/**
 * 尝试获取 URL 对应的"专属"本地 logo。
 * 优先级：
 * 1. 优先判断本地是否有全域名的logo（完整域名，如 www.example.com）
 * 2. 如果没有，再根据主域名判断本地是否存在（如 example.com）
 * 3. 否则返回 undefined，会从网络获取 favicon
 *
 * 用途：用户自定义添加的链接，如果刚好有内置 logo，则可直接使用；
 * 否则仍可走网络 favicon（不强制 generic，避免体验回退）。
 */
export function tryGetLogoForUrl(url: string): string | undefined {
  // 1. 优先尝试全域名
  const fullDomainKey = logoFileKeyFromUrl(url)
  const fullDomainRel = `../assets/logo/${fullDomainKey}.svg`
  if (LOGOS[fullDomainRel]) {
    return LOGOS[fullDomainRel]
  }

  // 2. 如果没有，尝试主域名
  const hostname = extractDomainFromUrl(url)
  const rootDomain = extractRootDomain(hostname)
  if (rootDomain && rootDomain !== hostname) {
    const rootDomainKey = rootDomain.toLowerCase().replace(/[^a-z0-9._-]/g, '_')
    const rootDomainRel = `../assets/logo/${rootDomainKey}.svg`
    if (LOGOS[rootDomainRel]) {
      return LOGOS[rootDomainRel]
    }
  }

  // 3. 都没有，返回 undefined，会从网络获取 favicon
  return undefined
}
