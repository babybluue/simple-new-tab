import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const PRESETS_FILE = path.join(ROOT, 'src', 'utils', 'presets.ts')
const OUT_DIR = path.join(ROOT, 'src', 'assets', 'logo')

const SIMPLE_ICONS_DATA = 'https://unpkg.com/simple-icons@latest/data/simple-icons.json'
const SIMPLE_ICONS_SVG_BASE = 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons'

function hostFromUrl(url) {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

function hostKey(host) {
  // 文件名安全：只保留 [a-z0-9._-]，其他全部转 _
  return host.toLowerCase().replace(/[^a-z0-9._-]/g, '_')
}

function svgWithEmbeddedImage({ mime, base64, size = 64 }) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n  <image width="${size}" height="${size}" href="data:${mime};base64,${base64}" />\n</svg>\n`
}

function applyBrandFill(svgText, hex) {
  if (!hex) return svgText
  const color = `#${hex.toLowerCase()}`
  if (/<svg[^>]*\sfill=/.test(svgText)) return svgText
  return svgText.replace(/<svg(\s[^>]*)?>/, m => m.replace('<svg', `<svg fill="${color}"`))
}

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.text()
}

async function fetchJson(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}

async function fetchArrayBuffer(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const ab = await res.arrayBuffer()
  const ct = res.headers.get('content-type') || 'image/png'
  return { ab, contentType: ct }
}

function bufferToBase64(ab) {
  return Buffer.from(ab).toString('base64')
}

function guessSimpleIconSlug(host) {
  // 粗略猜测：取最后两段的前一段（www.github.com -> github）
  const parts = host.split('.').filter(Boolean)
  if (parts.length < 2) return host
  const core = parts[parts.length - 2]
  return core.toLowerCase()
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })

  const presetsText = await fs.readFile(PRESETS_FILE, 'utf8')
  const urls = Array.from(presetsText.matchAll(/url:\s*'([^']+)'/g)).map(m => m[1])
  const hosts = Array.from(new Set(urls.map(hostFromUrl).filter(Boolean)))

  // 检查本地已有的文件
  const existingFiles = await fs.readdir(OUT_DIR)
  const existingKeys = new Set(existingFiles.filter(f => f.endsWith('.svg')).map(f => f.replace('.svg', '')))

  // 过滤出缺失的 hosts
  const missingHosts = hosts.filter(host => {
    const key = hostKey(host)
    return !existingKeys.has(key)
  })

  if (missingHosts.length === 0) {
    // eslint-disable-next-line no-console
    console.log('所有预设站点的 logo 都已存在，无需生成。')
    return
  }

  // eslint-disable-next-line no-console
  console.log(`发现 ${missingHosts.length} 个缺失的 logo，开始生成...\n`)

  // 读取 Simple Icons 数据（slug -> hex/title）
  const simpleIconsData = await fetchJson(SIMPLE_ICONS_DATA)
  // 处理 Simple Icons 数据格式：可能是数组或 { icons: [...] }
  const iconsArray = Array.isArray(simpleIconsData) 
    ? simpleIconsData 
    : (simpleIconsData?.icons || [])
  
  const simpleBySlug = new Map()
  for (const item of iconsArray) {
    if (item?.slug) simpleBySlug.set(item.slug, item)
  }

  // 一些常见域名与 Simple Icons slug 的差异（提高命中率）
  const SLUG_OVERRIDES = {
    'mail.google.com': 'gmail',
    'news.ycombinator.com': 'ycombinator',
    'portal.azure.com': 'microsoftazure',
    'aws.amazon.com': 'amazonwebservices',
    'store.steampowered.com': 'steam',
    'store.epicgames.com': 'epicgames',
    'y.qq.com': 'tencentqq',
    'music.163.com': 'neteasecloudmusic',
    'juejin.cn': 'juejin',
    'www.csdn.net': 'csdn',
    'www.v2ex.com': 'v2ex',
    'www.oschina.net': 'opensourceinitiative',
    // 日本站点
    'www.rakuten.co.jp': 'rakuten',
    'www.mercari.com': 'mercari',
    'www.yahoo.co.jp': 'yahoo',
    'line.me': 'line',
    'www.nicovideo.jp': 'niconico',
    'abema.tv': 'abema',
    'www.nhk.or.jp': 'nhk',
    'qiita.com': 'qiita',
    'zenn.dev': 'zenn',
    // 韩国站点
    'www.naver.com': 'naver',
    'www.daum.net': 'daum',
    'www.coupang.com': 'coupang',
    'www.gmarket.co.kr': 'gmarket',
    'www.kakaocorp.com': 'kakao',
    'www.melon.com': 'melon',
    'www.genie.co.kr': 'genie',
    'velog.io': 'velog',
    // 法国站点
    'www.amazon.fr': 'amazon',
    'www.cdiscount.com': 'cdiscount',
    'www.fnac.com': 'fnac',
    'www.lemonde.fr': 'lemonde',
    'www.lefigaro.fr': 'lefigaro',
    'www.deezer.com': 'deezer',
    // 德国站点
    'www.amazon.de': 'amazon',
    'www.otto.de': 'otto',
    'www.spiegel.de': 'spiegel',
    'www.bild.de': 'bild',
    // 西班牙站点
    'www.amazon.es': 'amazon',
    'www.elcorteingles.es': 'elcorteingles',
    'elpais.com': 'elpais',
    'www.elmundo.es': 'elmundo',
    // 俄罗斯站点
    'yandex.ru': 'yandex',
    'vk.com': 'vk',
    'ok.ru': 'odnoklassniki',
    'www.wildberries.ru': 'wildberries',
    'www.ozon.ru': 'ozon',
    'rutube.ru': 'rutube',
    'music.yandex.ru': 'yandex',
  }

  for (const host of missingHosts) {
    const key = hostKey(host)
    const outFile = path.join(OUT_DIR, `${key}.svg`)

    // 1) 优先 Simple Icons（品牌色 SVG）
    const slug = SLUG_OVERRIDES[host] || guessSimpleIconSlug(host)
    const meta = simpleBySlug.get(slug)
    if (meta?.slug) {
      try {
        const svgUrl = `${SIMPLE_ICONS_SVG_BASE}/${meta.slug}.svg`
        const svgRaw = await fetchText(svgUrl)
        const svg = applyBrandFill(svgRaw, meta.hex)
        await fs.writeFile(outFile, svg.trim() + '\n', 'utf8')
        // eslint-disable-next-line no-console
        console.log(`simple-icons: ${host} -> ${path.relative(ROOT, outFile)}`)
        continue
      } catch {
        // fall through -> favicon
      }
    }

    // 2) 否则下载该站点 favicon，并包装成 SVG（依然是本地 SVG）
    const faviconCandidates = [
      `https://${host}/favicon.ico`,
      `https://${host}/favicon.png`,
      `https://${host}/apple-touch-icon.png`,
      `https://unavatar.io/${host}`,
    ]

    let saved = false
    for (const u of faviconCandidates) {
      try {
        const { ab, contentType } = await fetchArrayBuffer(u)
        const base64 = bufferToBase64(ab)
        const mime = contentType.split(';')[0] || 'image/png'
        const svg = svgWithEmbeddedImage({ mime, base64, size: 64 })
        await fs.writeFile(outFile, svg, 'utf8')
        // eslint-disable-next-line no-console
        console.log(`favicon->svg: ${host} -> ${path.relative(ROOT, outFile)}`)
        saved = true
        break
      } catch {
        // try next
      }
    }

    if (!saved) {
      // 最终兜底：写一个通用 globe（保证 100% 有本地 logo）
      const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#64748b">\n  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"/>\n  <path fill=\"#fff\" d=\"M4.2 12c.7-2.9 3.3-5 6.6-5s5.9 2.1 6.6 5c-.7 2.9-3.3 5-6.6 5s-5.9-2.1-6.6-5Z\" opacity=\".25\"/>\n</svg>\n`
      await fs.writeFile(outFile, fallback, 'utf8')
      // eslint-disable-next-line no-console
      console.log(`fallback: ${host} -> ${path.relative(ROOT, outFile)}`)
    }
  }
}

await main()


