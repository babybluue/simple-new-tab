import { getFaviconWithSettings } from './favicon'
import { tryGetLogoForUrl } from './logo'
import type { QuickLink } from './types'
import { extractDomainFromUrl } from './url'

export interface BookmarkItem extends QuickLink {
  added?: boolean
}

/**
 * Recursively flatten bookmark tree nodes into a list of bookmark items.
 * @param nodes 书签树节点
 * @param useLocalFavicon 是否使用本地缓存的 favicon
 */
function flattenBookmarks(nodes: chrome.bookmarks.BookmarkTreeNode[], useLocalFavicon: boolean): BookmarkItem[] {
  const result: BookmarkItem[] = []

  for (const node of nodes) {
    // If it has a URL, it's a bookmark (not a folder)
    if (node.url) {
      const domain = extractDomainFromUrl(node.url)
      const logo = tryGetLogoForUrl(node.url)
      const favicon = logo ? undefined : getFaviconWithSettings({ domain, url: node.url }, useLocalFavicon)

      result.push({
        title: node.title || domain || node.url,
        url: node.url,
        domain,
        ...(logo ? { logo } : {}),
        ...(favicon ? { favicon } : {}),
      })
    }

    // Recursively process children (folders)
    if (node.children) {
      result.push(...flattenBookmarks(node.children, useLocalFavicon))
    }
  }

  return result
}

/**
 * Get all bookmarks from the user's bookmark bar and other bookmarks.
 * Filters out invalid URLs and duplicates.
 * @param useLocalFavicon 是否使用本地缓存的 favicon
 */
export async function getAllBookmarks(useLocalFavicon: boolean = false): Promise<BookmarkItem[]> {
  if (!chrome.bookmarks) {
    console.warn('Bookmarks API not available')
    return []
  }

  try {
    const tree = await chrome.bookmarks.getTree()
    const allBookmarks = flattenBookmarks(tree, useLocalFavicon)

    // Filter out invalid URLs and deduplicate by URL
    const seen = new Set<string>()
    return allBookmarks.filter(bookmark => {
      if (!bookmark.url || seen.has(bookmark.url)) return false
      // Filter out chrome:// and other internal URLs
      if (bookmark.url.startsWith('chrome://') || bookmark.url.startsWith('about:')) return false
      seen.add(bookmark.url)
      return true
    })
  } catch (error) {
    console.error('Failed to get bookmarks:', error)
    return []
  }
}
