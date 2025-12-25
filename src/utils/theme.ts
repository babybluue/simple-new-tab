import type { Settings } from './storage'

// 直接使用支持跨域的 Bing 壁纸直链服务，避免 JSON 请求被 CORS 拦截
// 服务说明：https://bing.biturl.top/ （常见镜像，若不可用可再替换）
const buildDirectBingImage = (idx: number, mkt = 'zh-CN') =>
  `https://bing.biturl.top/?resolution=1920&format=image&index=${idx}&mkt=${mkt}&rand=${Date.now()}`

const shuffleIndices = (max = 8) => Array.from({ length: max }, (_, i) => i).sort(() => Math.random() - 0.5)

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
