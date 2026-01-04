export interface QuickLink {
  title: string
  url: string
  /** 本地内置站点 logo（优先于 favicon 渲染） */
  logo?: string
  favicon?: string
  domain?: string
  category?: string
  default?: boolean
  /** 是否使用本地缓存的 favicon（而非在线服务） */
  useLocalFavicon?: boolean
}
