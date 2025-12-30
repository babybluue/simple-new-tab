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
export function performSearch(query: string, searchEngine: string = 'google', openInNewTab: boolean = false): void {
  if (!query.trim()) return

  const trimmedQuery = query.trim()

  const open = (url: string) => {
    if (openInNewTab) {
      chrome.tabs.create({ url })
    } else {
      chrome.tabs.update({ url })
    }
  }

  // 如果是 URL，直接导航
  if (isURL(trimmedQuery)) {
    const url = normalizeURL(trimmedQuery)
    open(url)
    return
  }

  // 否则使用搜索引擎搜索
  const engine = SEARCH_ENGINES[searchEngine] || SEARCH_ENGINES.google
  const searchUrl = `${engine.url}${encodeURIComponent(trimmedQuery)}`
  open(searchUrl)
}

// 获取搜索建议
export async function getSearchSuggestions(query: string, searchEngine: string = 'google'): Promise<string[]> {
  if (!query.trim()) return []

  const trimmedQuery = query.trim()

  try {
    switch (searchEngine) {
      case 'google': {
        const response = await fetch(
          `https://www.google.com/complete/search?client=chrome&q=${encodeURIComponent(trimmedQuery)}`
        )
        if (!response.ok) return []
        const data = await response.json()
        return Array.isArray(data) && data[1] ? data[1] : []
      }
      case 'baidu': {
        try {
          const callbackName = `baidu_suggest_${Date.now()}`
          const url = `https://suggestion.baidu.com/su?wd=${encodeURIComponent(trimmedQuery)}&cb=${callbackName}&t=${Date.now()}&csor=1&ie=utf-8&oe=utf-8`

          const response = await fetch(url)
          if (!response.ok) return []

          // 使用 UTF-8 文本解析（已显式指定 ie/oe=utf-8）
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
      case 'bing': {
        const response = await fetch(
          `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(trimmedQuery)}&language=zh-CN`
        )
        if (!response.ok) return []
        const data = await response.json()
        return Array.isArray(data) && data[1] ? data[1] : []
      }
      case 'duckduckgo': {
        const response = await fetch(`https://duckduckgo.com/ac/?q=${encodeURIComponent(trimmedQuery)}&kl=wt-wt`)
        if (!response.ok) return []
        const data = await response.json()
        if (Array.isArray(data)) {
          return data.map((item: any) => item.phrase || item).filter(Boolean)
        }
        return []
      }
      case 'yahoo': {
        try {
          const response = await fetch(
            `https://search.yahoo.com/sugg/gossip/gossip-us-ura/?output=fxjson&command=${encodeURIComponent(trimmedQuery)}`
          )
          if (!response.ok) return []
          const text = await response.text()
          // Yahoo 返回 JSONP 格式，需要提取 JSON 部分
          const jsonMatch = text.match(/\[.*\]/)
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0])
            return Array.isArray(data) && data[1] ? data[1] : []
          }
          return []
        } catch {
          return []
        }
      }
      case 'yandex': {
        try {
          const response = await fetch(
            `https://suggest.yandex.com/suggest-ff.cgi?part=${encodeURIComponent(trimmedQuery)}`
          )
          if (!response.ok) return []
          const text = await response.text()
          // Yandex 返回 JSONP 格式，需要提取 JSON 部分
          const jsonMatch = text.match(/\[.*\]/)
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0])
            return Array.isArray(data) && data[1] ? data[1] : []
          }
          return []
        } catch {
          return []
        }
      }
      default: {
        const response = await fetch(
          `https://www.google.com/complete/search?client=chrome&q=${encodeURIComponent(trimmedQuery)}`
        )
        if (!response.ok) return []
        const data = await response.json()
        return Array.isArray(data) && data[1] ? data[1] : []
      }
    }
  } catch {
    return []
  }
}
