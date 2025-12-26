import { addHistory, type HistoryItem } from '@/utils/storage'

export default defineBackground(() => {
  // 兼容 Chromium：某些环境下没有 `browser`（webextension-polyfill）
  const runtimeId = chrome?.runtime?.id
  console.log('Background script loaded', { id: runtimeId })

  // 监听标签页更新，记录访问历史
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // 只记录完全加载的页面（status === 'complete'）
    // 排除 chrome:// 和 chrome-extension:// 等内部页面
    // 排除新标签页本身
    if (
      changeInfo.status === 'complete' &&
      tab.url &&
      tab.title &&
      !tab.url.startsWith('chrome://') &&
      !tab.url.startsWith('chrome-extension://') &&
      !tab.url.startsWith('edge://') &&
      !tab.url.startsWith('about:') &&
      !tab.url.includes('newtab.html')
    ) {
      try {
        const historyItem: HistoryItem = {
          url: tab.url,
          title: tab.title,
          timestamp: Date.now(),
        }
        await addHistory(historyItem)
      } catch (error) {
        console.error('Failed to save history:', error)
      }
    }
  })
})
