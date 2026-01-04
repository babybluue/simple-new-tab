import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'wxt'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8')) as {
  version: string
}

// Chrome/Firefox extension "version" must be numeric dot-separated (no "-beta" etc.).
// We keep the full semver in version_name.
function toExtensionVersion(version: string): string {
  const m = version.match(/^(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?/)
  if (!m) throw new Error(`Invalid package.json version: "${version}"`)
  const [, major, minor, patch, build] = m
  return [major, minor, patch, build].filter(Boolean).join('.')
}

const extensionVersion = toExtensionVersion(pkg.version)

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-vue'],
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        vue: 'vue/dist/vue.runtime.esm-bundler.js',
      },
    },
    define: {
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false,
    },
  }),
  manifest: {
    default_locale: 'en',
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    version: extensionVersion,
    version_name: pkg.version,
    chrome_url_overrides: {
      newtab: 'newtab.html',
    },
    permissions: ['storage', 'tabs', 'bookmarks'],
    host_permissions: [
      'https://www.google.com/*',
      'https://api.bing.com/*',
      'https://www.bing.com/*',
      'https://cn.bing.com/*',
      'https://bing.biturl.top/*',
      'https://suggestion.baidu.com/*',
      'https://duckduckgo.com/*',
    ],
  },
})
