import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const DIR = path.join(ROOT, 'src', 'assets', 'logo', 'presets')

async function main() {
  try {
    const items = await fs.readdir(DIR)
    await Promise.all(items.map(name => fs.rm(path.join(DIR, name), { force: true })))
    // try remove dir (ok if fails)
    await fs.rmdir(DIR)
  } catch {
    // ignore
  }
}

await main()


