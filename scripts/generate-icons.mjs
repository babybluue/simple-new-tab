import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import sharp from 'sharp'

const root = process.cwd()
const srcSvg = path.join(root, 'public', 'icon', 'source.svg')
const outDir = path.join(root, 'public', 'icon')

const sizes = [16, 32, 48, 96, 128, 256, 512]

async function main() {
  await fs.mkdir(outDir, { recursive: true })

  const svg = await fs.readFile(srcSvg)
  for (const size of sizes) {
    const outPng = path.join(outDir, `${size}.png`)
    await sharp(svg, { density: 384 })
      .resize(size, size)
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true,
        palette: false,
      })
      .toFile(outPng)
    // eslint-disable-next-line no-console
    console.log(`generated: ${path.relative(root, outPng)}`)
  }
}

await main()

