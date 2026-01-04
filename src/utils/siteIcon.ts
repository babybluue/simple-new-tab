import { getFaviconWithSettings, type FaviconItem } from './favicon'
import { tryGetLogoForUrl } from './logo'

export interface SiteIconInput {
  url: string
  domain?: string
  /** 可选：已有的本地 logo（静态资源 URL） */
  logo?: string
  /** 可选：已有的 favicon（可能是自定义或在线） */
  favicon?: string
  /** 是否使用本地缓存的 favicon（单个链接设置） */
  useLocalFavicon?: boolean
}

/**
 * 统一的站点图标解析规则：
 * - 优先使用本地内置 logo（如果存在对应域名 svg）
 * - favicon 作为回退：优先用已有 favicon，否则计算默认在线 favicon（unavatar / /favicon.ico）
 *
 * 说明：
 * - 即使返回了 favicon，只要 logo 存在，`LinkCard` 初始也会先渲染 logo，不会触发 favicon 网络请求；
 *   只有当 logo 加载失败时，`LinkCard` 才会回退到 favicon。
 * @param input 站点图标输入
 * @param globalUseLocalFavicon 全局设置是否使用本地 favicon
 */
export function resolveSiteIcon(
  input: SiteIconInput,
  globalUseLocalFavicon: boolean = false
): { logo?: string; favicon?: string } {
  const logo = input.logo || tryGetLogoForUrl(input.url)
  const faviconItem: FaviconItem = {
    domain: input.domain,
    url: input.url,
    favicon: input.favicon,
    useLocalFavicon: input.useLocalFavicon,
  }
  const favicon = getFaviconWithSettings(faviconItem, globalUseLocalFavicon) || undefined
  return { ...(logo ? { logo } : {}), ...(favicon ? { favicon } : {}) }
}
