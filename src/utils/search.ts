import { getLogoForUrl } from './logo'

// 搜索引擎配置
export interface SearchEngine {
  name: string
  url: string
  /** 本地内置 logo（优先） */
  logo?: string
  icon: string
}

export const SEARCH_ENGINES: Record<string, SearchEngine> = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    logo: getLogoForUrl('https://www.google.com'),
    icon: getLogoForUrl('https://www.google.com'),
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    logo: getLogoForUrl('https://www.bing.com'),
    icon: getLogoForUrl('https://www.bing.com'),
  },
  baidu: {
    name: '百度',
    url: 'https://www.baidu.com/s?wd=',
    logo: getLogoForUrl('https://www.baidu.com'),
    icon: getLogoForUrl('https://www.baidu.com'),
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    logo: getLogoForUrl('https://duckduckgo.com'),
    icon: getLogoForUrl('https://duckduckgo.com'),
  },
  yahoo: {
    name: 'Yahoo',
    url: 'https://search.yahoo.com/search?p=',
    logo: getLogoForUrl('https://search.yahoo.com'),
    icon: getLogoForUrl('https://search.yahoo.com'),
  },
  yandex: {
    name: 'Yandex',
    url: 'https://yandex.com/search/?text=',
    logo: getLogoForUrl('https://yandex.com'),
    icon: getLogoForUrl('https://yandex.com'),
  },
}

// 常量
const HTTP_PROTOCOL = 'http:'
const HTTPS_PROTOCOL = 'https:'
const DOMAIN_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}/

/**
 * 检查字符串是否是 URL
 */
export function isURL(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === HTTP_PROTOCOL || url.protocol === HTTPS_PROTOCOL
  } catch {
    // 检查是否像 URL（包含域名格式）
    return DOMAIN_PATTERN.test(str)
  }
}

const HTTP_PREFIX = 'http://'
const HTTPS_PREFIX = 'https://'

/**
 * 规范化 URL，确保包含协议
 */
export function normalizeURL(str: string): string {
  if (str.startsWith(HTTP_PREFIX) || str.startsWith(HTTPS_PREFIX)) {
    return str
  }
  return `${HTTPS_PREFIX}${str}`
}

// 执行搜索或导航
export async function performSearch(
  query: string,
  searchEngine: string = 'google',
  openInNewTab: boolean = false
): Promise<void> {
  if (!query.trim()) return

  const trimmedQuery = query.trim()

  const open = async (url: string) => {
    if (openInNewTab) {
      try {
        // 获取当前标签页信息
        const currentTabs = await chrome.tabs.query({ active: true, currentWindow: true })
        const currentTab = currentTabs[0]
        if (currentTab && typeof currentTab.index === 'number') {
          // 在当前标签页的下一个位置创建新标签页
          chrome.tabs.create({ url, index: currentTab.index + 1 })
        } else {
          // 如果无法获取当前标签页索引，则使用默认行为
          chrome.tabs.create({ url })
        }
      } catch {
        // 如果出错，使用默认行为
        chrome.tabs.create({ url })
      }
    } else {
      chrome.tabs.update({ url })
    }
  }

  // 如果是 URL，直接导航
  if (isURL(trimmedQuery)) {
    const url = normalizeURL(trimmedQuery)
    await open(url)
    return
  }

  // 否则使用搜索引擎搜索
  const engine = SEARCH_ENGINES[searchEngine] || SEARCH_ENGINES.google
  const searchUrl = `${engine.url}${encodeURIComponent(trimmedQuery)}`
  await open(searchUrl)
}

// 搜索引擎 API 端点
const GOOGLE_SUGGEST_API = 'https://www.google.com/complete/search?client=chrome&q='
const BAIDU_SUGGEST_API = 'https://suggestion.baidu.com/su?wd='
const BING_SUGGEST_API = 'https://api.bing.com/osjson.aspx?query='
const DUCKDUCKGO_SUGGEST_API = 'https://duckduckgo.com/ac/?q='

/**
 * 从 Google/Bing 格式的响应中提取建议
 */
const extractSuggestionsFromArray = (data: unknown): string[] => {
  return Array.isArray(data) && Array.isArray(data[1]) ? data[1] : []
}

/**
 * 从百度 JSONP 响应中提取建议
 */
const extractBaiduSuggestions = async (query: string): Promise<string[]> => {
  try {
    const callbackName = `baidu_suggest_${Date.now()}`
    const url = `${BAIDU_SUGGEST_API}${encodeURIComponent(query)}&cb=${callbackName}&t=${Date.now()}&csor=1&ie=utf-8&oe=utf-8`

    const response = await fetch(url)
    if (!response.ok) return []

    let text = (await response.text()).trim()
    const startIndex = text.indexOf('{')
    const endIndex = text.lastIndexOf('}')

    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) return []

    // 提取对象部分并将未加引号的键名转为标准 JSON
    let objStr = text.slice(startIndex, endIndex + 1)
    objStr = objStr.replace(/([{,]\s*)([a-zA-Z_$][\w$]*)\s*:/g, '$1"$2":')

    const obj = JSON.parse(objStr)
    return Array.isArray(obj?.s) ? obj.s : []
  } catch {
    return []
  }
}

/**
 * 获取搜索建议
 */
export async function getSearchSuggestions(query: string, searchEngine: string = 'google'): Promise<string[]> {
  if (!query.trim()) return []

  const trimmedQuery = query.trim()

  try {
    switch (searchEngine) {
      case 'google': {
        const response = await fetch(`${GOOGLE_SUGGEST_API}${encodeURIComponent(trimmedQuery)}`)
        if (!response.ok) return []
        const data = await response.json()
        return extractSuggestionsFromArray(data)
      }
      case 'baidu': {
        return await extractBaiduSuggestions(trimmedQuery)
      }
      case 'bing': {
        const response = await fetch(`${BING_SUGGEST_API}${encodeURIComponent(trimmedQuery)}&language=zh-CN`)
        if (!response.ok) return []
        const data = await response.json()
        return extractSuggestionsFromArray(data)
      }
      case 'duckduckgo': {
        const response = await fetch(`${DUCKDUCKGO_SUGGEST_API}${encodeURIComponent(trimmedQuery)}&kl=wt-wt`)
        if (!response.ok) return []
        const data = await response.json()
        if (Array.isArray(data)) {
          return data.map((item: any) => item.phrase || item).filter(Boolean)
        }
        return []
      }
      default: {
        // 默认使用 Google
        const response = await fetch(`${GOOGLE_SUGGEST_API}${encodeURIComponent(trimmedQuery)}`)
        if (!response.ok) return []
        const data = await response.json()
        return extractSuggestionsFromArray(data)
      }
    }
  } catch {
    return []
  }
}
