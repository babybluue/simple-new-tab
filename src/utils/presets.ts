import { getLogoForUrl } from './logo'
import type { QuickLink } from './types'
import { extractDomainFromUrl } from './url'

const PRESET_QUICK_LINKS_RAW: QuickLink[] = [
  // 论坛 / 社交网络
  { title: 'Facebook', url: 'https://www.facebook.com', category: '社交' },
  { title: 'Instagram', url: 'https://www.instagram.com', category: '社交' },
  { title: 'LinkedIn', url: 'https://www.linkedin.com', category: '社交' },
  { title: 'X', url: 'https://x.com', category: '社交', default: true },
  { title: 'Reddit', url: 'https://www.reddit.com', category: '论坛', default: true },
  { title: 'Pinterest', url: 'https://www.pinterest.com', category: '社交' },
  { title: 'Tumblr', url: 'https://www.tumblr.com', category: '社交' },
  { title: 'Discord', url: 'https://discord.com', category: '社交' },
  { title: 'Telegram', url: 'https://web.telegram.org', category: '社交' },
  { title: 'TikTok', url: 'https://www.tiktok.com', category: '社交' },
  { title: 'Snapchat', url: 'https://www.snapchat.com', category: '社交' },
  { title: 'Mastodon', url: 'https://mastodon.social', category: '社交' },
  { title: 'Threads', url: 'https://www.threads.net', category: '社交' },
  { title: '微博', url: 'https://weibo.com', category: '社交', default: true },
  { title: '知乎', url: 'https://www.zhihu.com', category: '社区', default: true },
  { title: '小红书', url: 'https://www.xiaohongshu.com', category: '社区' },
  { title: '豆瓣', url: 'https://www.douban.com', category: '社区' },
  { title: '百度贴吧', url: 'https://tieba.baidu.com', category: '论坛' },
  { title: 'Medium', url: 'https://medium.com', category: '博客' },

  // 视频 / 娱乐
  { title: 'YouTube', url: 'https://www.youtube.com', category: '视频', default: true },
  { title: 'Netflix', url: 'https://www.netflix.com', category: '视频', default: true },
  { title: 'Disney+', url: 'https://www.disneyplus.com', category: '视频' },
  { title: 'Hulu', url: 'https://www.hulu.com', category: '视频' },
  { title: 'Max', url: 'https://www.max.com', category: '视频' },
  { title: 'Twitch', url: 'https://www.twitch.tv', category: '直播' },
  { title: '哔哩哔哩', url: 'https://www.bilibili.com', category: '视频', default: true },
  { title: '腾讯视频', url: 'https://v.qq.com', category: '视频' },
  { title: '爱奇艺', url: 'https://www.iqiyi.com', category: '视频' },
  { title: '优酷', url: 'https://www.youku.com', category: '视频' },
  { title: '抖音', url: 'https://www.douyin.com', category: '短视频' },
  { title: '快手', url: 'https://www.kuaishou.com', category: '短视频' },

  // 音乐 / 音频
  { title: 'Spotify', url: 'https://open.spotify.com', category: '音乐' },
  { title: 'Apple Music', url: 'https://music.apple.com', category: '音乐' },
  { title: 'YouTube Music', url: 'https://music.youtube.com', category: '音乐' },
  { title: 'QQ 音乐', url: 'https://y.qq.com', category: '音乐' },
  { title: '网易云音乐', url: 'https://music.163.com', category: '音乐' },

  // 办公 / 协同
  { title: 'Gmail', url: 'https://mail.google.com', category: '办公', default: true },
  { title: 'Outlook', url: 'https://outlook.live.com', category: '办公' },
  { title: 'Google Drive', url: 'https://drive.google.com', category: '办公' },
  { title: 'Google Docs', url: 'https://docs.google.com', category: '办公' },
  { title: 'Google Sheets', url: 'https://sheets.google.com', category: '办公' },
  { title: 'Microsoft Teams', url: 'https://teams.microsoft.com', category: '办公' },
  { title: 'Slack', url: 'https://slack.com', category: '办公' },
  { title: 'Zoom', url: 'https://zoom.us', category: '办公' },
  { title: 'Notion', url: 'https://www.notion.so', category: '办公' },
  { title: 'Dropbox', url: 'https://www.dropbox.com', category: '办公' },
  { title: 'OneDrive', url: 'https://onedrive.live.com', category: '办公' },

  // 开发 / 程序
  { title: 'GitHub', url: 'https://github.com', category: '开发', default: true },
  { title: 'GitLab', url: 'https://gitlab.com', category: '开发' },
  { title: 'Gitee', url: 'https://gitee.com', category: '开发' },
  { title: 'Stack Overflow', url: 'https://stackoverflow.com', category: '开发' },
  { title: 'MDN', url: 'https://developer.mozilla.org', category: '开发' },
  { title: 'AWS 控制台', url: 'https://aws.amazon.com/console/', category: '云' },
  { title: 'Azure Portal', url: 'https://portal.azure.com', category: '云' },
  { title: 'Vercel', url: 'https://vercel.com', category: '开发' },
  { title: 'Netlify', url: 'https://www.netlify.com', category: '开发' },
  { title: 'Cloudflare', url: 'https://dash.cloudflare.com', category: '云' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com', category: '资讯' },
  { title: '掘金', url: 'https://juejin.cn', category: '社区' },
  { title: 'CSDN', url: 'https://www.csdn.net', category: '社区' },
  { title: 'V2EX', url: 'https://www.v2ex.com', category: '社区' },
  { title: '开源中国', url: 'https://www.oschina.net', category: '社区' },

  // 游戏
  { title: 'Steam', url: 'https://store.steampowered.com', category: '游戏' },
  { title: 'Epic Games', url: 'https://store.epicgames.com', category: '游戏' },
  { title: 'PlayStation', url: 'https://www.playstation.com', category: '游戏' },
  { title: 'Xbox', url: 'https://www.xbox.com', category: '游戏' },
  { title: 'Nintendo', url: 'https://www.nintendo.com', category: '游戏' },

  // 购物
  { title: 'Amazon', url: 'https://www.amazon.com', category: '购物', default: true },
  { title: 'eBay', url: 'https://www.ebay.com', category: '购物' },
  { title: '淘宝', url: 'https://www.taobao.com', category: '购物', default: true },
  { title: '天猫', url: 'https://www.tmall.com', category: '购物' },
  { title: '京东', url: 'https://www.jd.com', category: '购物' },

  // AI
  { title: 'ChatGPT', url: 'https://chat.openai.com', category: 'AI', default: true },
  { title: 'Claude', url: 'https://claude.ai', category: 'AI' },
  { title: 'Gemini', url: 'https://gemini.google.com', category: 'AI', default: true },
  { title: 'Perplexity', url: 'https://www.perplexity.ai', category: 'AI' },
  { title: 'Midjourney', url: 'https://www.midjourney.com', category: 'AI' },
  { title: 'DeepSeek', url: 'https://chat.deepseek.com', category: 'AI' },
  { title: 'Grok', url: 'https://grok.com', category: 'AI' },
]

/**
 * 预设站点：补齐本地 logo（优先本地，缺失则为 generic.svg）。
 * 说明：这不会引入网络请求；真正的“网络 favicon”仅在没有本地 logo 时才会被使用。
 */
export const PRESET_QUICK_LINKS: QuickLink[] = PRESET_QUICK_LINKS_RAW.map(link => ({
  ...link,
  logo: link.logo || getLogoForUrl(link.url),
}))

// 网站标题的 i18n 映射（基于 URL）
// 如果网站标题在两种语言下相同，则不需要添加
export const PRESET_SITE_TITLES: Record<string, { zh: string; en: string }> = {
  'weibo.com': { zh: '微博', en: 'Weibo' },
  'www.zhihu.com': { zh: '知乎', en: 'Zhihu' },
  'www.xiaohongshu.com': { zh: '小红书', en: 'Xiaohongshu' },
  'www.douban.com': { zh: '豆瓣', en: 'Douban' },
  'tieba.baidu.com': { zh: '百度贴吧', en: 'Baidu Tieba' },
  'www.bilibili.com': { zh: '哔哩哔哩', en: 'Bilibili' },
  'v.qq.com': { zh: '腾讯视频', en: 'Tencent Video' },
  'www.iqiyi.com': { zh: '爱奇艺', en: 'iQiyi' },
  'www.youku.com': { zh: '优酷', en: 'Youku' },
  'www.douyin.com': { zh: '抖音', en: 'Douyin' },
  'www.kuaishou.com': { zh: '快手', en: 'Kuaishou' },
  'y.qq.com': { zh: 'QQ 音乐', en: 'QQ Music' },
  'music.163.com': { zh: '网易云音乐', en: 'NetEase Cloud Music' },
  'aws.amazon.com': { zh: 'AWS 控制台', en: 'AWS Console' },
  'juejin.cn': { zh: '掘金', en: 'Juejin' },
  'www.csdn.net': { zh: 'CSDN', en: 'CSDN' },
  'segmentfault.com': { zh: 'SegmentFault', en: 'SegmentFault' },
  'www.v2ex.com': { zh: 'V2EX', en: 'V2EX' },
  'www.oschina.net': { zh: '开源中国', en: 'OSChina' },
  'www.taobao.com': { zh: '淘宝', en: 'Taobao' },
  'www.tmall.com': { zh: '天猫', en: 'Tmall' },
  'www.jd.com': { zh: '京东', en: 'JD.com' },
  'www.pinduoduo.com': { zh: '拼多多', en: 'Pinduoduo' },
}

// 分类的 i18n 映射
export const PRESET_CATEGORIES: Record<string, { zh: string; en: string }> = {
  社交: { zh: '社交', en: 'Social' },
  论坛: { zh: '论坛', en: 'Forum' },
  社区: { zh: '社区', en: 'Community' },
  博客: { zh: '博客', en: 'Blog' },
  视频: { zh: '视频', en: 'Video' },
  直播: { zh: '直播', en: 'Live' },
  短视频: { zh: '短视频', en: 'Short Video' },
  音乐: { zh: '音乐', en: 'Music' },
  办公: { zh: '办公', en: 'Office' },
  开发: { zh: '开发', en: 'Development' },
  云: { zh: '云', en: 'Cloud' },
  资讯: { zh: '资讯', en: 'News' },
  游戏: { zh: '游戏', en: 'Gaming' },
  购物: { zh: '购物', en: 'Shopping' },
  AI: { zh: 'AI', en: 'AI' },
}

/**
 * 根据 URL 和当前语言获取本地化的网站标题
 */
export function getLocalizedSiteTitle(url: string, locale: 'zh' | 'en', fallbackTitle: string): string {
  const domain = extractDomainFromUrl(url) || url
  const mapping = PRESET_SITE_TITLES[domain]
  if (mapping) {
    return mapping[locale]
  }
  return fallbackTitle
}

/**
 * 根据分类和当前语言获取本地化的分类名称
 */
export function getLocalizedCategory(category: string | undefined, locale: 'zh' | 'en'): string | undefined {
  if (!category) return undefined
  const mapping = PRESET_CATEGORIES[category]
  if (mapping) {
    return mapping[locale]
  }
  return category
}
