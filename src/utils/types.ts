export interface QuickLink {
  title: string
  url: string
  /** 本地内置站点 logo（优先于 favicon 渲染） */
  logo?: string
  favicon?: string
  domain?: string
  category?: string
  default?: boolean
}
