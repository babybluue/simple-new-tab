import { extractDomainFromUrl } from './url'

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


