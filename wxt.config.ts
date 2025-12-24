import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-vue'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    chrome_url_overrides: {
      newtab: 'newtab.html',
    },
    permissions: ['storage', 'tabs'],
    host_permissions: [
      'https://www.google.com/*',
      'https://api.bing.com/*',
      'https://suggestion.baidu.com/*',
      'https://duckduckgo.com/*',
    ],
  },
})
