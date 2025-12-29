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

/**
 * 尝试获取 URL 对应的“专属”本地 logo。
 * - 找得到：返回对应 svg 的静态资源 URL
 * - 找不到：返回 undefined（不回退 generic.svg）
 *
 * 用途：用户自定义添加的链接，如果刚好有内置 logo，则可直接使用；
 * 否则仍可走网络 favicon（不强制 generic，避免体验回退）。
 */
export function tryGetLogoForUrl(url: string): string | undefined {
  const key = logoFileKeyFromUrl(url)
  const rel = `../assets/logo/${key}.svg`
  return LOGOS[rel]
}
