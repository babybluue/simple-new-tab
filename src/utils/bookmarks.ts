import { getPresetIconUrl } from './siteIcon'
import type { QuickLink } from './types'
import { extractDomainFromUrl } from './url'

export interface BookmarkItem extends QuickLink {
  added?: boolean
}

/**
 * Recursively flatten bookmark tree nodes into a list of bookmark items.
 */
function flattenBookmarks(nodes: chrome.bookmarks.BookmarkTreeNode[]): BookmarkItem[] {
  const result: BookmarkItem[] = []

  for (const node of nodes) {
    if (node.url) {
      const host = extractDomainFromUrl(node.url)
      const favicon = getPresetIconUrl(node.url)

      result.push({
        title: node.title || host || node.url,
        url: node.url,
        ...(favicon ? { favicon } : {}),
      })
    }

    if (node.children) {
      result.push(...flattenBookmarks(node.children))
    }
  }

  return result
}

/**
 * Get all bookmarks from the user's bookmark bar and other bookmarks.
 * Filters out invalid URLs and duplicates.
 */
export async function getAllBookmarks(): Promise<BookmarkItem[]> {
  if (!chrome.bookmarks) {
    console.warn('Bookmarks API not available')
    return []
  }

  try {
    const tree = await chrome.bookmarks.getTree()
    const allBookmarks = flattenBookmarks(tree)

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
