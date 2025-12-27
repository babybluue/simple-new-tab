import type { Settings } from './storage'

const STYLE_ID = 'user-custom-css'

export function applyCustomCss(settings: Pick<Settings, 'customCssEnabled' | 'customCss'>) {
  // MV3 service worker / non-DOM 环境兼容
  if (typeof document === 'undefined') return

  const enabled = !!settings.customCssEnabled
  const css = settings.customCss ?? ''
  const hasCss = css.trim().length > 0

  const existing = document.getElementById(STYLE_ID) as HTMLStyleElement | null

  if (!enabled || !hasCss) {
    existing?.remove()
    return
  }

  const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement
  const styleEl = existing || document.createElement('style')
  styleEl.id = STYLE_ID
  styleEl.type = 'text/css'
  styleEl.setAttribute('data-source', 'settings')
  styleEl.textContent = css

  if (!existing) {
    head.appendChild(styleEl)
  }
}


