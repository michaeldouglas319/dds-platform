/**
 * Blog utility functions
 * Helper functions for blog operations
 */

import { Post, PostVersion, User, PostStatus } from '@/lib/types/blog.types'

/**
 * Format author's display name
 */
export function formatAuthorName(author: User | undefined): string {
  if (!author) return 'Unknown Author'
  if (author.firstName && author.lastName) {
    return `${author.firstName} ${author.lastName}`
  }
  return author.firstName || author.email || 'Unknown Author'
}

/**
 * Format date for display
 */
export function formatPostDate(date: Date | string | undefined): string {
  if (!date) return 'Unknown date'

  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

/**
 * Format date with time
 */
export function formatPostDateTime(date: Date | string | undefined): string {
  if (!date) return 'Unknown date'

  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Calculate reading time in minutes
 */
export function calculateReadingTime(content: string): number {
  // Average reading speed is 200 words per minute
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove markdown/HTML tags and extra whitespace
  const cleanText = content
    .replace(/[*_`~\[\]()]/g, '')
    .replace(/\n+/g, ' ')
    .trim()

  if (cleanText.length <= maxLength) {
    return cleanText
  }

  // Truncate at word boundary
  return cleanText.substring(0, maxLength).split(' ').slice(0, -1).join(' ') + '...'
}

/**
 * Check if post is published
 */
export function isPublished(post: Post): boolean {
  return post.status === 'published' && post.publishedAt !== undefined
}

/**
 * Check if post is draft
 */
export function isDraft(post: Post): boolean {
  return post.status === 'draft'
}

/**
 * Get status badge color
 */
export function getStatusColor(status: PostStatus): string {
  switch (status) {
    case 'published':
      return 'bg-green-500/20 text-green-700'
    case 'draft':
      return 'bg-yellow-500/20 text-yellow-700'
    case 'archived':
      return 'bg-gray-500/20 text-gray-700'
    default:
      return 'bg-gray-500/20 text-gray-700'
  }
}

/**
 * Get status display label
 */
export function getStatusLabel(status: PostStatus): string {
  switch (status) {
    case 'published':
      return 'Published'
    case 'draft':
      return 'Draft'
    case 'archived':
      return 'Archived'
    default:
      return 'Unknown'
  }
}

/**
 * Sort posts by field
 */
export function sortPosts(
  posts: Post[],
  sortBy: 'createdAt' | 'updatedAt' | 'title' | 'viewCount' = 'updatedAt',
  order: 'asc' | 'desc' = 'desc'
): Post[] {
  return [...posts].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'viewCount':
        aValue = a.viewCount
        bValue = b.viewCount
        break
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      case 'updatedAt':
      default:
        aValue = new Date(a.updatedAt).getTime()
        bValue = new Date(b.updatedAt).getTime()
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1
    if (aValue > bValue) return order === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Filter posts by status
 */
export function filterPostsByStatus(posts: Post[], status: 'all' | PostStatus): Post[] {
  if (status === 'all') return posts
  return posts.filter((post) => post.status === status)
}

/**
 * Search posts by title or excerpt
 */
export function searchPosts(posts: Post[], query: string): Post[] {
  const lowerQuery = query.toLowerCase()
  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.excerpt?.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get unique tags from posts
 */
export function getUniqueTags(posts: Post[]): string[] {
  const tags = new Set<string>()
  posts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag))
  })
  return Array.from(tags).sort()
}

/**
 * Format tag slug
 */
export function formatTagSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Calculate word count from text
 */
export function getWordCount(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length
}

/**
 * Calculate reading time from word count
 */
export function getReadingTimeFromWordCount(wordCount: number): number {
  const wordsPerMinute = 200
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

/**
 * Check if post has been modified since creation
 */
export function hasBeenModified(post: Post): boolean {
  return new Date(post.createdAt).getTime() !== new Date(post.updatedAt).getTime()
}

/**
 * Get time since last update
 */
export function getTimeSinceUpdate(date: Date | string): string {
  const now = new Date()
  const postDate = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - postDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  if (diffMonths < 12) return `${diffMonths}mo ago`

  return formatPostDate(postDate)
}

/**
 * Validate post before publishing
 */
export function validatePostForPublishing(post: Partial<Post>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!post.title || post.title.trim().length === 0) {
    errors.push('Title is required')
  }

  if (!post.slug || post.slug.trim().length === 0) {
    errors.push('Slug is required')
  }

  if (!post.content) {
    errors.push('Content is required')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Create diff summary between two versions
 */
export function getDiffSummary(oldVersion: PostVersion, newVersion: PostVersion): string {
  const changes: string[] = []

  if (oldVersion.title !== newVersion.title) {
    changes.push(`Title changed from "${oldVersion.title}" to "${newVersion.title}"`)
  }

  if (oldVersion.excerpt !== newVersion.excerpt) {
    changes.push('Excerpt updated')
  }

  // You could add more sophisticated diff logic here
  if (JSON.stringify(oldVersion.content) !== JSON.stringify(newVersion.content)) {
    changes.push('Content updated')
  }

  return changes.length > 0 ? changes.join(', ') : 'No visible changes'
}
