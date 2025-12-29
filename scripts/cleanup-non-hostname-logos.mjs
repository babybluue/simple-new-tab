import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const LOGO_DIR = path.join(ROOT, 'src', 'assets', 'logo')
const PRESETS_FILE = path.join(ROOT, 'src', 'utils', 'presets.ts')

function hostFromUrl(url) {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

function hostKey(hostname) {
  return hostname.toLowerCase().replace(/[^a-z0-9._-]/g, '_')
}

async function main() {
  const presetsText = await fs.readFile(PRESETS_FILE, 'utf8')
  const urls = Array.from(presetsText.matchAll(/url:\s*'([^']+)'/g)).map(m => m[1])
  const extraUrls = [
    'https://www.google.com',
    'https://www.bing.com',
    'https://www.baidu.com',
    'https://duckduckgo.com',
  ]

  const hosts = Array.from(new Set([...urls, ...extraUrls].map(hostFromUrl).filter(Boolean)))
  const keep = new Set(hosts.map(h => `${hostKey(h)}.svg`))
  keep.add('generic.svg')

  const files = await fs.readdir(LOGO_DIR)
  const svgFiles = files.filter(f => f.toLowerCase().endsWith('.svg'))

  const removed = []
  for (const f of svgFiles) {
    if (!keep.has(f)) {
      await fs.rm(path.join(LOGO_DIR, f), { force: true })
      removed.push(f)
    }
  }

  // eslint-disable-next-line no-console
  console.log(`kept: ${keep.size}, scanned: ${svgFiles.length}, removed: ${removed.length}`)
  if (removed.length) {
    // eslint-disable-next-line no-console
    console.log('removed files:')
    // eslint-disable-next-line no-console
    console.log(removed.sort().join('\n'))
  }
}

await main()
