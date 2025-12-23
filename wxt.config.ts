import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  vite: () => ({
    plugins: [tailwindcss()] as any,
  }),
  manifest: {
    chrome_url_overrides: {
      newtab: 'newtab.html',
    },
    permissions: ['storage', 'tabs'],
  },
})
