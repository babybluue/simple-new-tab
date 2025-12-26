import type { QuickLink } from './types'
import { extractDomainFromUrl } from './url'

export const PRESET_QUICK_LINKS: QuickLink[] = [
  // 论坛 / 社交网络
  { title: 'Facebook', url: 'https://www.facebook.com', category: '社交' },
  { title: 'Instagram', url: 'https://www.instagram.com', category: '社交' },
  { title: 'LinkedIn', url: 'https://www.linkedin.com', category: '社交' },
  { title: 'X', url: 'https://x.com', category: '社交' },
  { title: 'Reddit', url: 'https://www.reddit.com', category: '论坛' },
  { title: 'Pinterest', url: 'https://www.pinterest.com', category: '社交' },
  { title: 'Tumblr', url: 'https://www.tumblr.com', category: '社交' },
  { title: 'Discord', url: 'https://discord.com', category: '社交' },
  { title: 'Telegram', url: 'https://web.telegram.org', category: '社交' },
  { title: 'TikTok', url: 'https://www.tiktok.com', category: '社交' },
  { title: 'Snapchat', url: 'https://www.snapchat.com', category: '社交' },
  { title: 'Mastodon', url: 'https://mastodon.social', category: '社交' },
  { title: 'Threads', url: 'https://www.threads.net', category: '社交' },
  { title: 'VK', url: 'https://vk.com', category: '社交' },
  { title: 'WhatsApp Web', url: 'https://web.whatsapp.com', category: '社交' },
  { title: '微信网页版', url: 'https://wx.qq.com', category: '社交' },
  { title: '微博', url: 'https://weibo.com', category: '社交' },
  { title: '知乎', url: 'https://www.zhihu.com', category: '社区' },
  { title: '小红书', url: 'https://www.xiaohongshu.com', category: '社区' },
  { title: '豆瓣', url: 'https://www.douban.com', category: '社区' },
  { title: '百度贴吧', url: 'https://tieba.baidu.com', category: '论坛' },
  { title: 'QQ 空间', url: 'https://qzone.qq.com', category: '社交' },
  { title: 'Line', url: 'https://line.me', category: '社交' },
  { title: 'Quora', url: 'https://www.quora.com', category: '问答' },
  { title: 'DeviantArt', url: 'https://www.deviantart.com', category: '社区' },
  { title: 'Dribbble', url: 'https://dribbble.com', category: '设计' },
  { title: 'Behance', url: 'https://www.behance.net', category: '设计' },
  { title: 'Medium', url: 'https://medium.com', category: '博客' },

  // 视频 / 娱乐
  { title: 'YouTube', url: 'https://www.youtube.com', category: '视频' },
  { title: 'Netflix', url: 'https://www.netflix.com', category: '视频' },
  { title: 'Disney+', url: 'https://www.disneyplus.com', category: '视频' },
  { title: 'Prime Video', url: 'https://www.primevideo.com', category: '视频' },
  { title: 'Hulu', url: 'https://www.hulu.com', category: '视频' },
  { title: 'Max', url: 'https://www.max.com', category: '视频' },
  { title: 'Twitch', url: 'https://www.twitch.tv', category: '直播' },
  { title: 'Vimeo', url: 'https://vimeo.com', category: '视频' },
  { title: 'Dailymotion', url: 'https://www.dailymotion.com', category: '视频' },
  { title: '哔哩哔哩', url: 'https://www.bilibili.com', category: '视频' },
  { title: '腾讯视频', url: 'https://v.qq.com', category: '视频' },
  { title: '爱奇艺', url: 'https://www.iqiyi.com', category: '视频' },
  { title: '优酷', url: 'https://www.youku.com', category: '视频' },
  { title: '抖音', url: 'https://www.douyin.com', category: '短视频' },
  { title: '快手', url: 'https://www.kuaishou.com', category: '短视频' },
  { title: '斗鱼', url: 'https://www.douyu.com', category: '直播' },

  // 音乐 / 音频
  { title: 'Spotify', url: 'https://open.spotify.com', category: '音乐' },
  { title: 'Apple Music', url: 'https://music.apple.com', category: '音乐' },
  { title: 'YouTube Music', url: 'https://music.youtube.com', category: '音乐' },
  { title: 'SoundCloud', url: 'https://soundcloud.com', category: '音乐' },
  { title: 'Deezer', url: 'https://www.deezer.com', category: '音乐' },
  { title: 'Pandora', url: 'https://www.pandora.com', category: '音乐' },
  { title: 'Amazon Music', url: 'https://music.amazon.com', category: '音乐' },
  { title: 'QQ 音乐', url: 'https://y.qq.com', category: '音乐' },
  { title: '网易云音乐', url: 'https://music.163.com', category: '音乐' },
  { title: 'Tidal', url: 'https://tidal.com', category: '音乐' },

  // 办公 / 协同
  { title: 'Gmail', url: 'https://mail.google.com', category: '办公' },
  { title: 'Outlook', url: 'https://outlook.live.com', category: '办公' },
  { title: 'Google Drive', url: 'https://drive.google.com', category: '办公' },
  { title: 'Google Docs', url: 'https://docs.google.com', category: '办公' },
  { title: 'Google Sheets', url: 'https://sheets.google.com', category: '办公' },
  { title: 'Google Calendar', url: 'https://calendar.google.com', category: '办公' },
  { title: 'Google Meet', url: 'https://meet.google.com', category: '办公' },
  { title: 'Microsoft Teams', url: 'https://teams.microsoft.com', category: '办公' },
  { title: 'Slack', url: 'https://slack.com', category: '办公' },
  { title: 'Zoom', url: 'https://zoom.us', category: '办公' },
  { title: 'Notion', url: 'https://www.notion.so', category: '办公' },
  { title: 'Trello', url: 'https://trello.com', category: '办公' },
  { title: 'Asana', url: 'https://asana.com', category: '办公' },
  { title: 'Jira', url: 'https://www.atlassian.com/software/jira', category: '办公' },
  { title: 'Confluence', url: 'https://www.atlassian.com/software/confluence', category: '办公' },
  { title: 'Dropbox', url: 'https://www.dropbox.com', category: '办公' },
  { title: 'OneDrive', url: 'https://onedrive.live.com', category: '办公' },
  { title: 'iCloud Drive', url: 'https://www.icloud.com', category: '办公' },

  // 开发 / 程序
  { title: 'GitHub', url: 'https://github.com', category: '开发' },
  { title: 'GitLab', url: 'https://gitlab.com', category: '开发' },
  { title: 'Gitee', url: 'https://gitee.com', category: '开发' },
  { title: 'Bitbucket', url: 'https://bitbucket.org', category: '开发' },
  { title: 'Stack Overflow', url: 'https://stackoverflow.com', category: '开发' },
  { title: 'MDN', url: 'https://developer.mozilla.org', category: '开发' },
  { title: 'npm', url: 'https://www.npmjs.com', category: '开发' },
  { title: 'PyPI', url: 'https://pypi.org', category: '开发' },
  { title: 'Docker Hub', url: 'https://hub.docker.com', category: '开发' },
  { title: 'Kubernetes', url: 'https://kubernetes.io', category: '开发' },
  { title: 'AWS 控制台', url: 'https://aws.amazon.com/console/', category: '云' },
  { title: 'Azure Portal', url: 'https://portal.azure.com', category: '云' },
  { title: 'Google Cloud Console', url: 'https://console.cloud.google.com', category: '云' },
  { title: 'Vercel', url: 'https://vercel.com', category: '开发' },
  { title: 'Netlify', url: 'https://www.netlify.com', category: '开发' },
  { title: 'Cloudflare', url: 'https://dash.cloudflare.com', category: '云' },
  { title: 'LeetCode', url: 'https://leetcode.com', category: '刷题' },
  { title: 'Codeforces', url: 'https://codeforces.com', category: '刷题' },
  { title: 'HackerRank', url: 'https://www.hackerrank.com', category: '刷题' },
  { title: 'Kaggle', url: 'https://www.kaggle.com', category: '数据' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com', category: '资讯' },
  { title: '掘金', url: 'https://juejin.cn', category: '社区' },
  { title: 'CSDN', url: 'https://www.csdn.net', category: '社区' },
  { title: 'SegmentFault', url: 'https://segmentfault.com', category: '社区' },
  { title: 'V2EX', url: 'https://www.v2ex.com', category: '社区' },
  { title: '开源中国', url: 'https://www.oschina.net', category: '社区' },

  // 游戏
  { title: 'Steam', url: 'https://store.steampowered.com', category: '游戏' },
  { title: 'Epic Games', url: 'https://store.epicgames.com', category: '游戏' },
  { title: 'PlayStation', url: 'https://www.playstation.com', category: '游戏' },
  { title: 'Xbox', url: 'https://www.xbox.com', category: '游戏' },
  { title: 'Nintendo', url: 'https://www.nintendo.com', category: '游戏' },
  { title: 'Battle.net', url: 'https://www.blizzard.com', category: '游戏' },
  { title: 'EA', url: 'https://www.ea.com', category: '游戏' },
  { title: 'Ubisoft Connect', url: 'https://www.ubisoft.com', category: '游戏' },
  { title: 'GOG', url: 'https://www.gog.com', category: '游戏' },
  { title: 'IGN', url: 'https://www.ign.com', category: '资讯' },
  { title: 'GameSpot', url: 'https://www.gamespot.com', category: '资讯' },
  { title: 'NGA 玩家社区', url: 'https://bbs.nga.cn', category: '社区' },

  // 新闻 / 资讯
  { title: 'BBC', url: 'https://www.bbc.com', category: '新闻' },
  { title: 'CNN', url: 'https://www.cnn.com', category: '新闻' },
  { title: '纽约时报', url: 'https://www.nytimes.com', category: '新闻' },
  { title: '华尔街日报', url: 'https://www.wsj.com', category: '新闻' },
  { title: '路透社', url: 'https://www.reuters.com', category: '新闻' },
  { title: '卫报', url: 'https://www.theguardian.com', category: '新闻' },
  { title: 'Bloomberg', url: 'https://www.bloomberg.com', category: '新闻' },
  { title: 'AP News', url: 'https://apnews.com', category: '新闻' },
  { title: 'Financial Times', url: 'https://www.ft.com', category: '新闻' },
  { title: '人民网', url: 'https://www.people.com.cn', category: '新闻' },
  { title: '新华网', url: 'http://www.xinhuanet.com', category: '新闻' },
  { title: '央视网', url: 'https://www.cctv.com', category: '新闻' },
  { title: '澎湃新闻', url: 'https://www.thepaper.cn', category: '新闻' },
  { title: '搜狐新闻', url: 'https://news.sohu.com', category: '新闻' },

  // 购物
  { title: 'Amazon', url: 'https://www.amazon.com', category: '购物' },
  { title: 'eBay', url: 'https://www.ebay.com', category: '购物' },
  { title: 'Walmart', url: 'https://www.walmart.com', category: '购物' },
  { title: 'Alibaba', url: 'https://www.alibaba.com', category: '购物' },
  { title: '淘宝', url: 'https://www.taobao.com', category: '购物' },
  { title: '天猫', url: 'https://www.tmall.com', category: '购物' },
  { title: '京东', url: 'https://www.jd.com', category: '购物' },
  { title: '拼多多', url: 'https://www.pinduoduo.com', category: '购物' },
  { title: '苏宁易购', url: 'https://www.suning.com', category: '购物' },
  { title: 'Best Buy', url: 'https://www.bestbuy.com', category: '购物' },

  // AI
  { title: 'ChatGPT', url: 'https://chat.openai.com', category: 'AI' },
  { title: 'Claude', url: 'https://claude.ai', category: 'AI' },
  { title: 'Gemini', url: 'https://gemini.google.com', category: 'AI' },
  { title: 'Microsoft Copilot', url: 'https://copilot.microsoft.com', category: 'AI' },
  { title: 'Perplexity', url: 'https://www.perplexity.ai', category: 'AI' },
  { title: 'Hugging Face', url: 'https://huggingface.co', category: 'AI' },
  { title: 'Replicate', url: 'https://replicate.com', category: 'AI' },
  { title: 'Midjourney', url: 'https://www.midjourney.com', category: 'AI' },
  { title: 'Stability AI', url: 'https://stability.ai', category: 'AI' },
  { title: 'Poe', url: 'https://poe.com', category: 'AI' },
  { title: 'DeepSeek', url: 'https://chat.deepseek.com', category: 'AI' },
  { title: 'Character.AI', url: 'https://character.ai', category: 'AI' },
  { title: 'Runway', url: 'https://runwayml.com', category: 'AI' },
  { title: 'ElevenLabs', url: 'https://elevenlabs.io', category: 'AI' },
  { title: 'GitHub Copilot', url: 'https://github.com/features/copilot', category: 'AI' },
  { title: 'Meta AI', url: 'https://www.meta.ai', category: 'AI' },
]

// 网站标题的 i18n 映射（基于 URL）
// 如果网站标题在两种语言下相同，则不需要添加
export const PRESET_SITE_TITLES: Record<string, { zh: string; en: string }> = {
  'wx.qq.com': { zh: '微信网页版', en: 'WeChat Web' },
  'weibo.com': { zh: '微博', en: 'Weibo' },
  'www.zhihu.com': { zh: '知乎', en: 'Zhihu' },
  'www.xiaohongshu.com': { zh: '小红书', en: 'Xiaohongshu' },
  'www.douban.com': { zh: '豆瓣', en: 'Douban' },
  'tieba.baidu.com': { zh: '百度贴吧', en: 'Baidu Tieba' },
  'qzone.qq.com': { zh: 'QQ 空间', en: 'QQ Zone' },
  'www.bilibili.com': { zh: '哔哩哔哩', en: 'Bilibili' },
  'v.qq.com': { zh: '腾讯视频', en: 'Tencent Video' },
  'www.iqiyi.com': { zh: '爱奇艺', en: 'iQiyi' },
  'www.youku.com': { zh: '优酷', en: 'Youku' },
  'www.douyin.com': { zh: '抖音', en: 'Douyin' },
  'www.kuaishou.com': { zh: '快手', en: 'Kuaishou' },
  'www.douyu.com': { zh: '斗鱼', en: 'Douyu' },
  'y.qq.com': { zh: 'QQ 音乐', en: 'QQ Music' },
  'music.163.com': { zh: '网易云音乐', en: 'NetEase Cloud Music' },
  'aws.amazon.com': { zh: 'AWS 控制台', en: 'AWS Console' },
  'juejin.cn': { zh: '掘金', en: 'Juejin' },
  'www.csdn.net': { zh: 'CSDN', en: 'CSDN' },
  'segmentfault.com': { zh: 'SegmentFault', en: 'SegmentFault' },
  'www.v2ex.com': { zh: 'V2EX', en: 'V2EX' },
  'www.oschina.net': { zh: '开源中国', en: 'OSChina' },
  'bbs.nga.cn': { zh: 'NGA 玩家社区', en: 'NGA Gaming Community' },
  'www.nytimes.com': { zh: '纽约时报', en: 'The New York Times' },
  'www.wsj.com': { zh: '华尔街日报', en: 'The Wall Street Journal' },
  'www.reuters.com': { zh: '路透社', en: 'Reuters' },
  'www.theguardian.com': { zh: '卫报', en: 'The Guardian' },
  'www.people.com.cn': { zh: '人民网', en: 'People.cn' },
  'www.xinhuanet.com': { zh: '新华网', en: 'Xinhua News' },
  'www.cctv.com': { zh: '央视网', en: 'CCTV' },
  'www.thepaper.cn': { zh: '澎湃新闻', en: 'The Paper' },
  'news.sohu.com': { zh: '搜狐新闻', en: 'Sohu News' },
  'www.taobao.com': { zh: '淘宝', en: 'Taobao' },
  'www.tmall.com': { zh: '天猫', en: 'Tmall' },
  'www.jd.com': { zh: '京东', en: 'JD.com' },
  'www.pinduoduo.com': { zh: '拼多多', en: 'Pinduoduo' },
  'www.suning.com': { zh: '苏宁易购', en: 'Suning' },
}

// 分类的 i18n 映射
export const PRESET_CATEGORIES: Record<string, { zh: string; en: string }> = {
  社交: { zh: '社交', en: 'Social' },
  论坛: { zh: '论坛', en: 'Forum' },
  社区: { zh: '社区', en: 'Community' },
  问答: { zh: '问答', en: 'Q&A' },
  设计: { zh: '设计', en: 'Design' },
  博客: { zh: '博客', en: 'Blog' },
  视频: { zh: '视频', en: 'Video' },
  直播: { zh: '直播', en: 'Live' },
  短视频: { zh: '短视频', en: 'Short Video' },
  音乐: { zh: '音乐', en: 'Music' },
  办公: { zh: '办公', en: 'Office' },
  开发: { zh: '开发', en: 'Development' },
  云: { zh: '云', en: 'Cloud' },
  刷题: { zh: '刷题', en: 'Coding Practice' },
  数据: { zh: '数据', en: 'Data' },
  资讯: { zh: '资讯', en: 'News' },
  游戏: { zh: '游戏', en: 'Gaming' },
  新闻: { zh: '新闻', en: 'News' },
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
