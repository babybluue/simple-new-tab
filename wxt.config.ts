import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'wxt'

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
    chrome_url_overrides: {
      newtab: 'newtab.html',
    },
    permissions: ['storage', 'tabs'],
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
