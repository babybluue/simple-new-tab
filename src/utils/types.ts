export interface QuickLink {
  title: string
  url: string
  /** 预设图标（assets/logo）或历史数据中的预设路径；展示时优先于 Chrome 缓存 */
  favicon?: string
  /** 用户自定义图标 URL（最高优先级） */
  customFavicon?: string
}
