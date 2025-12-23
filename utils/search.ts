// 搜索引擎配置
export interface SearchEngine {
  name: string
  url: string
}

export const SEARCH_ENGINES: Record<string, SearchEngine> = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
  },
  baidu: {
    name: '百度',
    url: 'https://www.baidu.com/s?wd=',
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
  },
}

// 检查是否是 URL
export function isURL(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    // 检查是否像 URL（包含 . 和 /）
    return /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}/.test(str)
  }
}

// 规范化 URL
export function normalizeURL(str: string): string {
  if (str.startsWith('http://') || str.startsWith('https://')) {
    return str
  }
  return `https://${str}`
}

// 执行搜索或导航
export function performSearch(query: string, searchEngine: string = 'google'): void {
  if (!query.trim()) return

  const trimmedQuery = query.trim()

  // 如果是 URL，直接导航
  if (isURL(trimmedQuery)) {
    const url = normalizeURL(trimmedQuery)
    chrome.tabs.update({ url })
    return
  }

  // 否则使用搜索引擎搜索
  const engine = SEARCH_ENGINES[searchEngine] || SEARCH_ENGINES.google
  const searchUrl = `${engine.url}${encodeURIComponent(trimmedQuery)}`
  chrome.tabs.update({ url: searchUrl })
}
