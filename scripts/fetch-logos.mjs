import fs from 'node:fs/promises'
import path from 'node:path'

const OUT_DIR = path.join(process.cwd(), 'src', 'assets', 'logo')
const SIMPLE_ICONS_BASE = 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons'
const SIMPLE_ICONS_DATA = 'https://unpkg.com/simple-icons@latest/data/simple-icons.json'
const SUPERTINY_BASE = 'https://raw.githubusercontent.com/edent/SuperTinyIcons/master/images/svg'

/**
 * fileName (without .svg) -> { source, slug }
 * - Simple Icons / SuperTinyIcons 均为开源 SVG 图标库（适合离线内置到扩展）。
 */
const ICONS = {
  // 搜索引擎
  google: { source: 'simple', slug: 'google' },
  bing: { source: 'supertiny', slug: 'bing' },
  baidu: { source: 'simple', slug: 'baidu' },
  duckduckgo: { source: 'simple', slug: 'duckduckgo' },

  // 站点
  github: { source: 'simple', slug: 'github' },
  youtube: { source: 'simple', slug: 'youtube' },
  reddit: { source: 'simple', slug: 'reddit' },
  x: { source: 'simple', slug: 'x' },
  facebook: { source: 'simple', slug: 'facebook' },
  instagram: { source: 'simple', slug: 'instagram' },
  linkedin: { source: 'supertiny', slug: 'linkedin' },
  discord: { source: 'simple', slug: 'discord' },
  telegram: { source: 'simple', slug: 'telegram' },
  tiktok: { source: 'simple', slug: 'tiktok' },
  netflix: { source: 'simple', slug: 'netflix' },
  gmail: { source: 'simple', slug: 'gmail' },
  spotify: { source: 'simple', slug: 'spotify' },
  amazon: { source: 'supertiny', slug: 'amazon' },
  taobao: { source: 'simple', slug: 'taobao' },
  bilibili: { source: 'simple', slug: 'bilibili' },
  sinaweibo: { source: 'simple', slug: 'sinaweibo' },
  zhihu: { source: 'simple', slug: 'zhihu' },
  chatgpt: { source: 'supertiny', slug: 'chatgpt' },
}

const GENERIC_SVG = `<!-- MIT: simple custom globe icon -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">\n  <path d="M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0Z"/>\n  <path d="M3 12h18"/>\n  <path d="M12 3c2.5 2.5 4 5.6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.6-4-9s1.5-6.5 4-9Z"/>\n</svg>\n`

async function download(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.text()
}

async function downloadJson(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}

function applyBrandFillToSimpleIconSvg(svgText, hex) {
  if (!hex) return svgText
  const color = `#${hex.toLowerCase()}`
  // Simple Icons 的 SVG 通常只有 path，没有显式 fill；给 <svg> 增加 fill 即可。
  if (/<svg[^>]*\sfill=/.test(svgText)) return svgText
  return svgText.replace(/<svg(\s[^>]*)?>/, m => {
    if (m.includes('fill=')) return m
    // 注：用 fill 而不是 currentColor，确保 img 渲染时是品牌色（不受主题影响）
    return m.replace('<svg', `<svg fill="${color}"`)
  })
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })
  await fs.writeFile(path.join(OUT_DIR, 'generic.svg'), GENERIC_SVG, 'utf8')

  // 读取 Simple Icons 元数据（获取品牌色 hex）
  let simpleIconHexBySlug = {}
  try {
    const data = await downloadJson(SIMPLE_ICONS_DATA)
    const items = Array.isArray(data) ? data : data?.icons ?? []
    for (const item of items) {
      if (item?.slug && item?.hex) simpleIconHexBySlug[item.slug] = item.hex
    }
  } catch {
    // ignore: 若失败则仍会下载 SVG，只是不会注入品牌色
  }

  const entries = Object.entries(ICONS)
  for (const [fileName, meta] of entries) {
    const base = meta.source === 'supertiny' ? SUPERTINY_BASE : SIMPLE_ICONS_BASE
    const url = `${base}/${meta.slug}.svg`
    const outFile = path.join(OUT_DIR, `${fileName}.svg`)
    try {
      let svg = await download(url)
      if (meta.source === 'simple') {
        const hex = simpleIconHexBySlug[meta.slug]
        svg = applyBrandFillToSimpleIconSvg(svg, hex)
      }
      await fs.writeFile(outFile, svg.trim() + '\n', 'utf8')
      // eslint-disable-next-line no-console
      console.log(`downloaded: ${path.relative(process.cwd(), outFile)}`)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`failed: ${fileName} (${url}) -> fallback generic.svg`, e?.message ?? e)
      await fs.writeFile(outFile, GENERIC_SVG, 'utf8')
    }
  }
}

await main()


