import { getSiteFavicon, getUnavatarFavicon } from './favicon'
import { tryGetLogoForUrl } from './logo'
import type { QuickLink } from './types'
import { extractDomainFromUrl } from './url'

const PRESET_QUICK_LINKS_RAW: QuickLink[] = [
  // 按字母顺序排列
  { title: 'AbemaTV', url: 'https://abema.tv', category: '视频' },
  { title: 'Amazon', url: 'https://www.amazon.com', category: '购物', default: true },
  { title: 'Apple Music', url: 'https://music.apple.com', category: '音乐' },
  { title: 'AWS 控制台', url: 'https://aws.amazon.com/console/', category: '云' },
  { title: 'Azure Portal', url: 'https://portal.azure.com', category: '云' },
  { title: '百度贴吧', url: 'https://tieba.baidu.com', category: '论坛' },
  { title: 'Bild', url: 'https://www.bild.de', category: '资讯' },
  { title: '哔哩哔哩', url: 'https://www.bilibili.com', category: '视频', default: true },
  { title: 'ChatGPT', url: 'https://chat.openai.com', category: 'AI', default: true },
  { title: 'Claude', url: 'https://claude.ai', category: 'AI' },
  { title: 'Cloudflare', url: 'https://dash.cloudflare.com', category: '云' },
  { title: 'Coupang', url: 'https://www.coupang.com', category: '购物', default: true },
  { title: 'CSDN', url: 'https://www.csdn.net', category: '社区' },
  { title: 'Cdiscount', url: 'https://www.cdiscount.com', category: '购物' },
  { title: 'Daum', url: 'https://www.daum.net', category: '资讯' },
  { title: 'DeepSeek', url: 'https://chat.deepseek.com', category: 'AI' },
  { title: 'Deezer', url: 'https://www.deezer.com', category: '音乐' },
  { title: 'Discord', url: 'https://discord.com', category: '社交' },
  { title: 'Disney+', url: 'https://www.disneyplus.com', category: '视频' },
  { title: '豆瓣', url: 'https://www.douban.com', category: '社区' },
  { title: '抖音', url: 'https://www.douyin.com', category: '短视频' },
  { title: 'Dropbox', url: 'https://www.dropbox.com', category: '办公' },
  { title: 'eBay', url: 'https://www.ebay.com', category: '购物' },
  { title: 'El Corte Inglés', url: 'https://www.elcorteingles.es', category: '购物' },
  { title: 'El Mundo', url: 'https://www.elmundo.es', category: '资讯' },
  { title: 'El País', url: 'https://elpais.com', category: '资讯' },
  { title: 'Epic Games', url: 'https://store.epicgames.com', category: '游戏' },
  { title: 'Facebook', url: 'https://www.facebook.com', category: '社交' },
  { title: '飞书', url: 'https://www.feishu.cn', category: '办公' },
  { title: 'Fnac', url: 'https://www.fnac.com', category: '购物' },
  { title: 'Gemini', url: 'https://gemini.google.com', category: 'AI', default: true },
  { title: 'Genie Music', url: 'https://www.genie.co.kr', category: '音乐' },
  { title: 'Gitee', url: 'https://gitee.com', category: '开发' },
  { title: 'GitHub', url: 'https://github.com', category: '开发', default: true },
  { title: 'GitLab', url: 'https://gitlab.com', category: '开发' },
  { title: 'Gmail', url: 'https://mail.google.com', category: '办公', default: true },
  { title: 'Gmarket', url: 'https://www.gmarket.co.kr', category: '购物' },
  { title: 'Google Docs', url: 'https://docs.google.com', category: '办公' },
  { title: 'Google Drive', url: 'https://drive.google.com', category: '办公' },
  { title: 'Google Sheets', url: 'https://sheets.google.com', category: '办公' },
  { title: 'Grok', url: 'https://grok.com', category: 'AI' },
  { title: 'Hacker News', url: 'https://news.ycombinator.com', category: '资讯' },
  { title: 'Hulu', url: 'https://www.hulu.com', category: '视频' },
  { title: 'Instagram', url: 'https://www.instagram.com', category: '社交' },
  { title: '爱奇艺', url: 'https://www.iqiyi.com', category: '视频' },
  { title: '京东', url: 'https://www.jd.com', category: '购物' },
  { title: '掘金', url: 'https://juejin.cn', category: '社区' },
  { title: 'KakaoTalk', url: 'https://www.kakaocorp.com', category: '社交', default: true },
  { title: '快手', url: 'https://www.kuaishou.com', category: '短视频' },
  { title: 'Le Figaro', url: 'https://www.lefigaro.fr', category: '资讯' },
  { title: 'Le Monde', url: 'https://www.lemonde.fr', category: '资讯' },
  { title: 'LINE', url: 'https://line.me', category: '社交', default: true },
  { title: 'LinkedIn', url: 'https://www.linkedin.com', category: '社交' },
  { title: 'Mastodon', url: 'https://mastodon.social', category: '社交' },
  { title: 'Max', url: 'https://www.max.com', category: '视频' },
  { title: 'MDN', url: 'https://developer.mozilla.org', category: '开发' },
  { title: 'Medium', url: 'https://medium.com', category: '博客' },
  { title: 'Melon', url: 'https://www.melon.com', category: '音乐' },
  { title: 'Mercari', url: 'https://www.mercari.com/jp', category: '购物' },
  { title: 'Microsoft Teams', url: 'https://teams.microsoft.com', category: '办公' },
  { title: 'Midjourney', url: 'https://www.midjourney.com', category: 'AI' },
  { title: 'Naver', url: 'https://www.naver.com', category: '资讯', default: true },
  { title: 'Netflix', url: 'https://www.netflix.com', category: '视频', default: true },
  { title: 'Netlify', url: 'https://www.netlify.com', category: '开发' },
  { title: 'NHK', url: 'https://www.nhk.or.jp', category: '资讯' },
  { title: 'NicoNico', url: 'https://www.nicovideo.jp', category: '视频' },
  { title: 'Nintendo', url: 'https://www.nintendo.com', category: '游戏' },
  { title: 'Notion', url: 'https://www.notion.so', category: '办公' },
  { title: 'Odnoklassniki', url: 'https://ok.ru', category: '社交' },
  { title: 'OneDrive', url: 'https://onedrive.live.com', category: '办公' },
  { title: '开源中国', url: 'https://www.oschina.net', category: '社区' },
  { title: 'Outlook', url: 'https://outlook.live.com', category: '办公' },
  { title: 'Otto', url: 'https://www.otto.de', category: '购物' },
  { title: 'Ozon', url: 'https://www.ozon.ru', category: '购物' },
  { title: 'Perplexity', url: 'https://www.perplexity.ai', category: 'AI' },
  { title: 'Pinterest', url: 'https://www.pinterest.com', category: '社交' },
  { title: 'PlayStation', url: 'https://www.playstation.com', category: '游戏' },
  { title: 'QQ 邮箱', url: 'https://mail.qq.com', category: '办公' },
  { title: 'QQ 音乐', url: 'https://y.qq.com', category: '音乐' },
  { title: 'Qiita', url: 'https://qiita.com', category: '开发' },
  { title: 'Rakuten', url: 'https://www.rakuten.co.jp', category: '购物' },
  { title: 'Reddit', url: 'https://www.reddit.com', category: '论坛', default: true },
  { title: 'Rutube', url: 'https://rutube.ru', category: '视频' },
  { title: 'Slack', url: 'https://slack.com', category: '办公' },
  { title: 'Snapchat', url: 'https://www.snapchat.com', category: '社交' },
  { title: 'Spiegel Online', url: 'https://www.spiegel.de', category: '资讯' },
  { title: 'Spotify', url: 'https://open.spotify.com', category: '音乐' },
  { title: 'Stack Overflow', url: 'https://stackoverflow.com', category: '开发' },
  { title: 'Steam', url: 'https://store.steampowered.com', category: '游戏' },
  { title: 'Telegram', url: 'https://web.telegram.org', category: '社交' },
  { title: 'Threads', url: 'https://www.threads.net', category: '社交' },
  { title: 'TikTok', url: 'https://www.tiktok.com', category: '社交' },
  { title: '天猫', url: 'https://www.tmall.com', category: '购物' },
  { title: 'Tumblr', url: 'https://www.tumblr.com', category: '社交' },
  { title: 'Twitch', url: 'https://www.twitch.tv', category: '直播' },
  { title: 'V2EX', url: 'https://www.v2ex.com', category: '社区' },
  { title: 'Velog', url: 'https://velog.io', category: '开发' },
  { title: 'Vercel', url: 'https://vercel.com', category: '开发' },
  { title: 'VK', url: 'https://vk.com', category: '社交' },
  { title: 'X', url: 'https://x.com', category: '社交', default: true },
  { title: 'Xbox', url: 'https://www.xbox.com', category: '游戏' },
  { title: 'Yahoo! Japan', url: 'https://www.yahoo.co.jp', category: '资讯', default: true },
  { title: 'Yandex', url: 'https://yandex.ru', category: '资讯' },
  { title: 'YouTube', url: 'https://www.youtube.com', category: '视频', default: true },
  { title: 'YouTube Music', url: 'https://music.youtube.com', category: '音乐' },
  { title: 'Zenn', url: 'https://zenn.dev', category: '开发' },
  { title: 'Zoom', url: 'https://zoom.us', category: '办公' },
  { title: '淘宝', url: 'https://www.taobao.com', category: '购物', default: true },
  { title: '腾讯视频', url: 'https://v.qq.com', category: '视频' },
  { title: '微博', url: 'https://weibo.com', category: '社交', default: true },
  { title: '网易云音乐', url: 'https://music.163.com', category: '音乐' },
  { title: '微信读书', url: 'https://weread.qq.com', category: '阅读' },
  { title: '闲鱼', url: 'https://www.goofish.com', category: '购物' },
  { title: '小红书', url: 'https://www.xiaohongshu.com', category: '社区' },
  { title: '优酷', url: 'https://www.youku.com', category: '视频' },
  { title: '知乎', url: 'https://www.zhihu.com', category: '社区', default: true },
  { title: 'Wildberries', url: 'https://www.wildberries.ru', category: '购物' },
]

/**
 * 预设站点：补齐本地 logo 或在线 favicon。
 * - 优先使用本地 logo（如果存在对应域名 svg）
 * - 如果没有本地 logo，则使用在线 favicon（unavatar 或站点 favicon.ico）
 * 说明：这不会在构建时引入网络请求；在线 favicon 会在运行时按需加载。
 */
export const PRESET_QUICK_LINKS: QuickLink[] = PRESET_QUICK_LINKS_RAW.map(link => {
  const domain = link.domain || extractDomainFromUrl(link.url)
  const logo = link.logo || tryGetLogoForUrl(link.url)

  // 如果没有本地 logo，使用在线 favicon
  const favicon = logo
    ? link.favicon // 如果有本地 logo，保留已有的 favicon（如果有）
    : link.favicon || getUnavatarFavicon({ domain, url: link.url }) || getSiteFavicon({ domain, url: link.url })

  return {
    ...link,
    domain,
    ...(logo ? { logo } : {}),
    ...(favicon ? { favicon } : {}),
  }
})

// 网站标题的 i18n 映射（基于 URL）
// 如果网站标题在多种语言下相同，则不需要添加
export const PRESET_SITE_TITLES: Record<
  string,
  {
    zh?: string
    en?: string
    ja?: string
    ko?: string
    fr?: string
    de?: string
    es?: string
    ru?: string
  }
> = {
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
  'weread.qq.com': { zh: '微信读书', en: 'WeChat Reading' },
  'www.feishu.cn': { zh: '飞书', en: 'Feishu' },
  'mail.qq.com': { zh: 'QQ 邮箱', en: 'QQ Email' },
  'www.goofish.com': { zh: '闲鱼', en: 'Xianyu' },
  // 日本站点
  'www.rakuten.co.jp': { zh: '乐天', en: 'Rakuten', ja: '楽天' },
  'www.mercari.com': { zh: 'Mercari', en: 'Mercari', ja: 'メルカリ' },
  'www.yahoo.co.jp': { zh: 'Yahoo! Japan', en: 'Yahoo! Japan', ja: 'Yahoo! JAPAN' },
  'line.me': { zh: 'LINE', en: 'LINE', ja: 'LINE' },
  'www.nicovideo.jp': { zh: 'NicoNico', en: 'NicoNico', ja: 'ニコニコ動画' },
  'abema.tv': { zh: 'AbemaTV', en: 'AbemaTV', ja: 'ABEMA' },
  'www.nhk.or.jp': { zh: 'NHK', en: 'NHK', ja: 'NHK' },
  'qiita.com': { zh: 'Qiita', en: 'Qiita', ja: 'Qiita' },
  'zenn.dev': { zh: 'Zenn', en: 'Zenn', ja: 'Zenn' },
  // 韩国站点
  'www.naver.com': { zh: 'Naver', en: 'Naver', ko: '네이버' },
  'www.daum.net': { zh: 'Daum', en: 'Daum', ko: '다음' },
  'www.coupang.com': { zh: 'Coupang', en: 'Coupang', ko: '쿠팡' },
  'www.gmarket.co.kr': { zh: 'Gmarket', en: 'Gmarket', ko: '지마켓' },
  'www.kakaocorp.com': { zh: 'Kakao', en: 'Kakao', ko: '카카오' },
  'www.melon.com': { zh: 'Melon', en: 'Melon', ko: '멜론' },
  'www.genie.co.kr': { zh: 'Genie Music', en: 'Genie Music', ko: '지니뮤직' },
  'velog.io': { zh: 'Velog', en: 'Velog', ko: '벨로그' },
  // 法国站点
  'www.amazon.fr': { zh: 'Amazon 法国', en: 'Amazon France', fr: 'Amazon France' },
  'www.cdiscount.com': { zh: 'Cdiscount', en: 'Cdiscount', fr: 'Cdiscount' },
  'www.fnac.com': { zh: 'Fnac', en: 'Fnac', fr: 'Fnac' },
  'www.lemonde.fr': { zh: '世界报', en: 'Le Monde', fr: 'Le Monde' },
  'www.lefigaro.fr': { zh: '费加罗报', en: 'Le Figaro', fr: 'Le Figaro' },
  'www.deezer.com': { zh: 'Deezer', en: 'Deezer', fr: 'Deezer' },
  // 德国站点
  'www.amazon.de': { zh: 'Amazon 德国', en: 'Amazon Germany', de: 'Amazon Deutschland' },
  'www.otto.de': { zh: 'Otto', en: 'Otto', de: 'Otto' },
  'www.spiegel.de': { zh: '明镜周刊', en: 'Der Spiegel', de: 'Der Spiegel' },
  'www.bild.de': { zh: '图片报', en: 'Bild', de: 'Bild' },
  // 西班牙站点
  'www.amazon.es': { zh: 'Amazon 西班牙', en: 'Amazon Spain', es: 'Amazon España' },
  'www.elcorteingles.es': { zh: 'El Corte Inglés', en: 'El Corte Inglés', es: 'El Corte Inglés' },
  'elpais.com': { zh: '国家报', en: 'El País', es: 'El País' },
  'www.elmundo.es': { zh: '世界报', en: 'El Mundo', es: 'El Mundo' },
  // 俄罗斯站点
  'yandex.ru': { zh: 'Yandex', en: 'Yandex', ru: 'Яндекс' },
  'vk.com': { zh: 'VK', en: 'VK', ru: 'ВКонтакте' },
  'ok.ru': { zh: 'Odnoklassniki', en: 'Odnoklassniki', ru: 'Одноклассники' },
  'www.wildberries.ru': { zh: 'Wildberries', en: 'Wildberries', ru: 'Wildberries' },
  'www.ozon.ru': { zh: 'Ozon', en: 'Ozon', ru: 'Ozon' },
  'rutube.ru': { zh: 'Rutube', en: 'Rutube', ru: 'Rutube' },
  'music.yandex.ru': { zh: 'Yandex Music', en: 'Yandex Music', ru: 'Яндекс Музыка' },
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
  阅读: { zh: '阅读', en: 'Reading' },
}

/**
 * 根据 URL 和当前语言获取本地化的网站标题
 */
export function getLocalizedSiteTitle(
  url: string,
  locale: 'zh_CN' | 'zh_TW' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'ru',
  fallbackTitle?: string
): string {
  const domain = extractDomainFromUrl(url) || url
  const mapping = PRESET_SITE_TITLES[domain]
  if (mapping) {
    // 根据语言选择对应的标题
    let localeKey: keyof typeof mapping
    if (locale === 'zh_CN' || locale === 'zh_TW') {
      localeKey = 'zh'
    } else {
      localeKey = locale
    }

    // 如果当前语言有映射，直接返回
    if (mapping[localeKey]) {
      return mapping[localeKey]!
    }

    // 如果当前语言没有映射，尝试使用英文作为后备
    if (mapping.en) {
      return mapping.en
    }

    // 如果英文也没有，尝试使用中文作为后备
    if (mapping.zh) {
      return mapping.zh
    }
  }
  // 如果 fallbackTitle 为空，使用域名作为后备
  if (fallbackTitle) {
    return fallbackTitle
  }
  // 使用域名作为最后的后备
  return domain || url
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
