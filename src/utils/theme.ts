import type { Settings } from './storage'

// 直接使用支持跨域的 Bing 壁纸直链服务，避免 JSON 请求被 CORS 拦截
// 服务说明：https://bing.biturl.top/ （常见镜像，若不可用可再替换）
const BING_POOL_SIZE = 8
const RECENT_INDICES_KEY = 'bingRecentIndices'

const buildDirectBingImage = (idx: number, mkt = 'zh-CN') =>
  `https://bing.biturl.top/?resolution=1920&format=image&index=${idx}&mkt=${mkt}`

const shuffleIndices = (max = BING_POOL_SIZE) =>
  Array.from({ length: max }, (_, i) => i).sort(() => Math.random() - 0.5)

const parseBingIndexFromUrl = (url?: string): number | null => {
  if (!url) return null
  try {
    const u = new URL(url)
    const raw = u.searchParams.get('index')
    if (!raw) return null
    const n = Number.parseInt(raw, 10)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

async function getRecentBingIndices(): Promise<number[]> {
  try {
    const result = await chrome.storage.local.get(RECENT_INDICES_KEY)
    const raw = result[RECENT_INDICES_KEY] as unknown
    if (!Array.isArray(raw)) return []
    return raw.filter(v => typeof v === 'number' && Number.isFinite(v))
  } catch {
    return []
  }
}

async function setRecentBingIndices(indices: number[]): Promise<void> {
  try {
    // 仅保留最近 BING_POOL_SIZE 个，避免无限增长
    const next = indices.slice(0, BING_POOL_SIZE)
    await chrome.storage.local.set({ [RECENT_INDICES_KEY]: next })
  } catch {
    // 静默失败
  }
}

async function rememberBingIndex(idx: number): Promise<void> {
  const recent = await getRecentBingIndices()
  const next = [idx, ...recent.filter(v => v !== idx)].slice(0, BING_POOL_SIZE)
  await setRecentBingIndices(next)
}

// Bing 图片缓存相关
const CACHE_NAME = 'bing-background-cache'
const CACHE_KEY = 'bingBackgroundUrl'

/**
 * 获取缓存的 Bing 图片 URL
 */
async function getCachedBingImageUrl(): Promise<string | null> {
  try {
    const result = await chrome.storage.local.get(CACHE_KEY)
    const cachedUrl = result[CACHE_KEY] as string | undefined
    return cachedUrl || null
  } catch {
    return null
  }
}

/**
 * 缓存 Bing 图片
 */
async function cacheBingImage(imageUrl: string): Promise<void> {
  try {
    // 使用 Cache API 缓存图片
    const cache = await caches.open(CACHE_NAME)
    await cache.add(imageUrl)

    // 同时将 URL 存储在 chrome.storage 中，方便快速访问
    await chrome.storage.local.set({ [CACHE_KEY]: imageUrl })
  } catch {
    // 静默失败
  }
}

/**
 * 清除 Bing 图片缓存
 */
export async function clearBingImageCache(): Promise<void> {
  try {
    // 清除 Cache API 缓存
    const cache = await caches.open(CACHE_NAME)
    const keys = await cache.keys()
    await Promise.all(keys.map(key => cache.delete(key)))

    // 清除 chrome.storage 中的缓存
    await chrome.storage.local.remove([CACHE_KEY, RECENT_INDICES_KEY])
  } catch {
    // 静默失败
  }
}

// Light 和 Dark 主题背景色常量
// 使用稍微偏灰的浅色，避免纯白色显得过于空泛
export const THEME_LIGHT_BG = '#f1f3f5'
export const THEME_DARK_BG = '#0f172a'

export const applyTheme = (theme: Settings['theme']) => {
  const root = document.documentElement
  if (!root) return

  // 设置主题文字颜色的 CSS 变量
  const setTextColor = (isLight: boolean) => {
    if (isLight) {
      // light 模式：深色文字
      root.style.setProperty('--app-text-color', 'rgba(33, 53, 71, 0.95)')
      root.style.setProperty('--app-text-color-secondary', 'rgba(33, 53, 71, 0.8)')
      root.style.setProperty('--app-text-color-tertiary', 'rgba(33, 53, 71, 0.65)')
    } else {
      // dark 模式：浅色文字
      root.style.setProperty('--app-text-color', 'rgba(255, 255, 255, 0.95)')
      root.style.setProperty('--app-text-color-secondary', 'rgba(255, 255, 255, 0.8)')
      root.style.setProperty('--app-text-color-tertiary', 'rgba(255, 255, 255, 0.65)')
    }
  }

  if (theme === 'light') {
    root.classList.remove('dark')
    root.classList.add('light')
    setTextColor(true)
  } else if (theme === 'dark') {
    root.classList.remove('light')
    root.classList.add('dark')
    setTextColor(false)
  } else {
    // auto 模式：根据系统偏好设置
    root.classList.remove('light', 'dark')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
      setTextColor(false)
    } else {
      root.classList.add('light')
      setTextColor(true)
    }
  }
}

export const fetchBingImageUrl = async (excludeUrl?: string, useCache = true): Promise<string | null> => {
  // 如果需要使用缓存且没有排除 URL，先尝试从缓存获取
  if (useCache && !excludeUrl) {
    const cachedUrl = await getCachedBingImageUrl()
    if (cachedUrl) {
      // 验证缓存是否有效
      try {
        const cache = await caches.open(CACHE_NAME)
        const cached = await cache.match(cachedUrl)
        if (cached) {
          // 记住本次返回的 index，用于下次“刷新不重复”
          const cachedIndex = parseBingIndexFromUrl(cachedUrl)
          if (cachedIndex !== null) {
            rememberBingIndex(cachedIndex).catch(() => {})
          }

          // 异步获取新图片并更新缓存（不阻塞）
          fetchBingImageUrl(excludeUrl, false)
            .then(newUrl => {
              if (newUrl) cacheBingImage(newUrl)
            })
            .catch(() => {
              // 静默失败
            })
          return cachedUrl
        }
      } catch {
        // 缓存无效，继续获取新图片
      }
    }
  }

  // 获取新的图片 URL
  const indices = shuffleIndices(BING_POOL_SIZE)
  let newUrl: string | null = null
  const excludeIndex = parseBingIndexFromUrl(excludeUrl)
  const recent = await getRecentBingIndices()

  const pickIndex = (blocked: Set<number>): number | null => {
    for (const idx of indices) {
      if (!blocked.has(idx)) return idx
    }
    return null
  }

  // 先尽量做到：不等于上一张 + 不在最近出现过
  const blocked1 = new Set<number>(recent)
  if (excludeIndex !== null) blocked1.add(excludeIndex)
  let picked = pickIndex(blocked1)

  // 如果 8 张都“最近用过”了，就重置最近记录（保留上一张），再选一个不同的
  if (picked === null) {
    const keep = excludeIndex !== null ? [excludeIndex] : []
    await setRecentBingIndices(keep)
    const blocked2 = new Set<number>(keep)
    picked = pickIndex(blocked2)
  }

  if (picked === null) {
    // 兜底：至少保证和上一张不同（如果能解析到 index）
    const fallbackPool = shuffleIndices(BING_POOL_SIZE)
    const fallback = fallbackPool.find(i => (excludeIndex === null ? true : i !== excludeIndex)) ?? 0
    picked = fallback
  }

  newUrl = buildDirectBingImage(picked)
  rememberBingIndex(picked).catch(() => {})

  // 缓存新图片（异步，不阻塞返回）
  if (useCache && newUrl) {
    cacheBingImage(newUrl).catch(() => {
      // 静默失败
    })
  }

  return newUrl
}

// 存储当前的 blob URL，用于后续释放
let currentBlobUrl: string | null = null

const toCssUrl = (rawUrl: string): string => {
  // 统一把 URL 包在引号中，避免 &、空格等字符导致 CSS url() 解析异常
  // encodeURI 不会破坏已有的 query 参数（会处理空格等不安全字符）
  const encoded = encodeURI(rawUrl).replace(/"/g, '\\"')
  return `url("${encoded}")`
}

export const applyBackground = async (
  settings: Pick<Settings, 'backgroundType' | 'backgroundColor' | 'backgroundImageUrl'>
): Promise<string | undefined> => {
  const root = document.documentElement
  if (!root) return

  // 释放之前的 blob URL
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl)
    currentBlobUrl = null
  }

  root.style.backgroundAttachment = 'fixed'
  root.style.backgroundSize = 'cover'
  root.style.backgroundRepeat = 'no-repeat'
  root.style.backgroundPosition = 'center'

  // 根据主题确定蒙层颜色和透明度
  const isLight = root.classList.contains('light')
  const overlayColor = isLight ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'

  if (settings.backgroundType === 'bing' || settings.backgroundType === 'upload' || settings.backgroundType === 'url') {
    let imageUrl: string | null = null
    let originalUrl: string | undefined = undefined

    if (settings.backgroundType === 'bing') {
      // 优先使用已有的 URL，否则获取新图片（使用缓存）
      originalUrl = settings.backgroundImageUrl
      imageUrl = originalUrl || (await fetchBingImageUrl(originalUrl, true))
      originalUrl = imageUrl || originalUrl
    } else {
      imageUrl = settings.backgroundImageUrl || null
      originalUrl = imageUrl || undefined
    }

    if (imageUrl) {
      // 尝试从缓存中获取 blob URL 以提升加载速度
      try {
        // 仅对 bing 背景做 Cache API 缓存命中（其他在线 URL 可能是一次性的签名链接，不强制依赖缓存）
        if (settings.backgroundType === 'bing') {
          const cache = await caches.open(CACHE_NAME)
          const cached = await cache.match(imageUrl)
          if (cached) {
            const blob = await cached.blob()
            currentBlobUrl = URL.createObjectURL(blob)
            imageUrl = currentBlobUrl
          }
        }
      } catch {
        // 如果缓存获取失败，使用原始 URL
      }

      // 添加蒙层：使用 linear-gradient 叠加半透明蒙层（透明度 30%）
      root.style.backgroundImage = ''
      root.style.background = `linear-gradient(${overlayColor}, ${overlayColor}), center center / cover no-repeat fixed ${toCssUrl(imageUrl)}`
      return originalUrl
    }

    root.style.backgroundImage = ''
    root.style.background = '#0b1224'
    root.style.backgroundColor = '#0b1224'
    return undefined
  }

  // 判断是否是渐变背景（linear-gradient 或 radial-gradient）
  const isGradient = settings.backgroundColor.includes('gradient')

  if (isGradient) {
    // 渐变背景需要设置为 background-image
    root.style.setProperty('background-image', settings.backgroundColor, 'important')
    root.style.setProperty('background-color', 'transparent', 'important')
  } else {
    // 纯色背景设置为 background-color
    root.style.setProperty('background-color', settings.backgroundColor, 'important')
    root.style.setProperty('background-image', 'none', 'important')
  }

  // 设置其他背景属性
  root.style.setProperty('background-attachment', 'fixed', 'important')
  root.style.setProperty('background-size', 'cover', 'important')
  root.style.setProperty('background-repeat', 'no-repeat', 'important')
  root.style.setProperty('background-position', 'center', 'important')
  return undefined
}

export const applyPrimaryColor = (color: string) => {
  const root = document.documentElement
  if (!root) return
  const fallback = '#667eea'
  const base = color || fallback
  root.style.setProperty('--primary-color', base)
  root.style.setProperty('--primary-surface', base)
  // 边框颜色会根据主题在 buildPrimarySurfaceStyle 中动态设置
  root.style.setProperty('--primary-border', 'rgba(255,255,255,0.2)')
}

export const buildPrimarySurfaceStyle = (primaryColor?: string) => {
  const root = document.documentElement
  const isLight = root.classList.contains('light')

  const surfaceColor = primaryColor || (isLight ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)')

  // 根据主题设置合适的边框颜色
  // 浅色模式：使用深色边框；深色模式：使用浅色边框
  let borderColor: string
  if (primaryColor) {
    // 如果主色是浅色背景色（light theme bg），在浅色模式下使用深色边框
    if (isLight && (primaryColor === '#f1f3f5' || primaryColor === THEME_LIGHT_BG)) {
      borderColor = 'rgba(33, 53, 71, 0.2)' // 使用浅色模式的边框颜色
    } else if (!isLight && (primaryColor === '#0f172a' || primaryColor === THEME_DARK_BG)) {
      borderColor = 'rgba(255, 255, 255, 0.15)' // 使用深色模式的边框颜色
    } else {
      // 其他主色，根据主题选择边框颜色
      borderColor = isLight ? 'rgba(33, 53, 71, 0.2)' : 'rgba(255, 255, 255, 0.2)'
    }
  } else {
    // 没有主色时，根据主题设置默认边框颜色
    borderColor = isLight ? 'rgba(33, 53, 71, 0.18)' : 'rgba(255, 255, 255, 0.18)'
  }

  return {
    background: surfaceColor,
    borderColor,
  }
}
