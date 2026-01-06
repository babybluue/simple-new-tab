;(async () => {
  const root = document.documentElement

  try {
    const { settings } = await chrome.storage.local.get('settings')
    const cfg = settings || {}

    // 预先应用主题类，避免闪烁
    if (cfg.theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else if (cfg.theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('light', 'dark')
    }

    // 快速应用背景色（如果有且不是图片类型），完整逻辑在 main.ts 中处理
    if (cfg.backgroundColor && cfg.backgroundType !== 'bing' && cfg.backgroundType !== 'upload') {
      const isGradient = cfg.backgroundColor.includes('gradient')
      root.style.setProperty('background-attachment', 'fixed', 'important')
      root.style.setProperty('background-size', 'cover', 'important')
      root.style.setProperty('background-repeat', 'no-repeat', 'important')
      root.style.setProperty('background-position', 'center', 'important')

      if (isGradient) {
        root.style.setProperty('background-image', cfg.backgroundColor, 'important')
        root.style.setProperty('background-color', 'transparent', 'important')
      } else {
        root.style.setProperty('background-color', cfg.backgroundColor, 'important')
        root.style.setProperty('background-image', 'none', 'important')
      }
    }
  } catch {
    // 静默失败，由 main.ts 处理
  }
})()


