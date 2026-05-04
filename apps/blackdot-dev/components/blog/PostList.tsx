'use client'

import { Post } from '@/lib/types/blog.types'
import { PostListItem } from './PostListItem'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface PostListProps {
  posts: Post[]
  isLoading?: boolean
  onSelectPost?: (post: Post) => void
  onEditPost?: (post: Post) => void
  onDeletePost?: (postId: string) => void
  onCreatePost?: () => void
  selectedPostId?: string
}

/**
 * List of blog posts with filtering and actions
 */
export function PostList({
  posts,
  isLoading,
  onSelectPost,
  onEditPost,
  onDeletePost,
  onCreatePost,
  selectedPostId,
}: PostListProps) {
  // Ensure posts is always an array
  const postsList = Array.isArray(posts) ? posts : []

  return (
    <div className="flex flex-col h-full bg-background/60 backdrop-blur-3xl border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.3)] w-[280px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Posts</h3>
        {onCreatePost && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onCreatePost}
            title="Create new post"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Posts list */}
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-2">
          {isLoading ? (
            <div className="px-2 py-4 text-xs text-muted-foreground text-center">
              Loading posts...
            </div>
          ) : postsList.length === 0 ? (
            <div className="px-2 py-4 text-xs text-muted-foreground text-center">
              No posts yet
            </div>
          ) : (
            postsList.map((post) => (
              <div
                key={post.id}
                onClick={() => onSelectPost?.(post)}
                className="cursor-pointer"
              >
                <PostListItem
                  post={post}
                  onEdit={onEditPost}
                  onDelete={onDeletePost}
                  isSelected={selectedPostId === post.id}
                />
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
