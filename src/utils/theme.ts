import type { Settings } from './storage'

// 直接使用支持跨域的 Bing 壁纸直链服务，避免 JSON 请求被 CORS 拦截
// 服务说明：https://bing.biturl.top/ （常见镜像，若不可用可再替换）
const buildDirectBingImage = (idx: number, mkt = 'zh-CN') =>
  `https://bing.biturl.top/?resolution=1920&format=image&index=${idx}&mkt=${mkt}&rand=${Date.now()}`

const shuffleIndices = (max = 8) =>
  Array.from({ length: max }, (_, i) => i).sort(() => Math.random() - 0.5)

export const applyTheme = (theme: Settings['theme']) => {
  const root = document.documentElement
  if (!root) return

  if (theme === 'light') {
    root.classList.remove('dark')
    root.classList.add('light')
  } else if (theme === 'dark') {
    root.classList.remove('light')
    root.classList.add('dark')
  } else {
    root.classList.remove('light', 'dark')
  }
}

export const fetchBingImageUrl = async (excludeUrl?: string): Promise<string | null> => {
  const indices = shuffleIndices(8)
  for (const idx of indices) {
    const candidate = buildDirectBingImage(idx)
    if (candidate !== excludeUrl) return candidate
  }
  return buildDirectBingImage(Math.floor(Math.random() * 8))
}

export const applyBackground = async (
  settings: Pick<Settings, 'backgroundType' | 'backgroundColor' | 'backgroundImageUrl'>
): Promise<string | undefined> => {
  const root = document.documentElement
  if (!root) return

  root.style.backgroundAttachment = 'fixed'
  root.style.backgroundSize = 'cover'
  root.style.backgroundRepeat = 'no-repeat'
  root.style.backgroundPosition = 'center'

  if (settings.backgroundType === 'bing' || settings.backgroundType === 'upload') {
    const imageUrl =
      settings.backgroundType === 'bing'
        ? settings.backgroundImageUrl || (await fetchBingImageUrl(settings.backgroundImageUrl))
        : settings.backgroundImageUrl

    if (imageUrl) {
      root.style.backgroundImage = ''
      root.style.background = `center center / cover no-repeat fixed url(${imageUrl})`
      return imageUrl
    }

    root.style.backgroundImage = ''
    root.style.background = '#0b1224'
    root.style.backgroundColor = '#0b1224'
    return undefined
  }

  root.style.backgroundImage = ''
  root.style.background = settings.backgroundColor
  root.style.backgroundColor = settings.backgroundColor
  return undefined
}

const hexWithAlpha = (hex: string, alphaHex: string) => {
  const normalized = hex.startsWith('#') && (hex.length === 7 || hex.length === 4) ? hex : ''
  if (!normalized) return ''
  if (hex.length === 4) {
    const r = hex[1]
    const g = hex[2]
    const b = hex[3]
    return `#${r}${r}${g}${g}${b}${b}${alphaHex}`
  }
  return `${hex}${alphaHex}`
}

export const applyPrimaryColor = (color: string) => {
  const root = document.documentElement
  if (!root) return
  const fallback = '#667eea'
  const base = color || fallback
  const border = hexWithAlpha(base, '33') || 'rgba(255,255,255,0.25)'
  const surface = hexWithAlpha(base, '1f') || 'rgba(255,255,255,0.12)'

  root.style.setProperty('--primary-color', base)
  root.style.setProperty('--primary-surface', surface)
  root.style.setProperty('--primary-border', border)
}

