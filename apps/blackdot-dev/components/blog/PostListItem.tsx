'use client'

import { Post } from '@/lib/types/blog.types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPostDate, getStatusLabel, getStatusColor, isPublished } from '@/lib/blog/utils'
import { Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

interface PostListItemProps {
  post: Post
  onEdit?: (post: Post) => void
  onDelete?: (postId: string) => void
  isSelected?: boolean
}

/**
 * Single post card in post list
 */
export function PostListItem({
  post,
  onEdit,
  onDelete,
  isSelected,
}: PostListItemProps) {
  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-white/10 bg-background/40 hover:bg-background/60'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {post.title}
            </h3>
            <Badge variant="outline" className={getStatusColor(post.status)}>
              {getStatusLabel(post.status)}
            </Badge>
          </div>

          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {post.excerpt}
            </p>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{formatPostDate(post.updatedAt)}</span>
            {post.viewCount && post.viewCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {post.viewCount} views
              </span>
            )}
            {post.tags && post.tags.length > 0 && (
              <span className="flex gap-1">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{post.tags.length - 2}
                  </Badge>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          {isPublished(post) && (
            <Link href={`/blog/${post.slug}`} target="_blank">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="View published post"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}

          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(post)}
              title="Edit post"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => onDelete(post.id)}
              title="Delete post"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
