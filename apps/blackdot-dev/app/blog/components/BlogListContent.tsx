'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMobileDetection } from '@/hooks'
import { PostList, PostListItem } from '@/components/blog'
import { Post } from '@/lib/types/blog.types'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathnameBreadcrumbs } from '@/lib/contexts'

/**
 * Blog list page client component
 */
export function BlogListContent() {
  const { user, isLoaded } = useUser()
  const isMobile = useMobileDetection(1024)

  // Set breadcrumbs for blog page
  usePathnameBreadcrumbs()

  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'published'>('all')

  // Load user's posts on mount
  useEffect(() => {
    const loadPosts = async () => {
      if (!isLoaded || !user) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/posts?myDrafts=true`)
        const data = await response.json()
        // Handle both array and object response formats
        const postsList = Array.isArray(data) ? data : data.posts || []
        setPosts(postsList)
        if (postsList.length > 0) {
          setSelectedPostId(postsList[0].id)
        }
      } catch (error) {
        console.error('Failed to load posts:', error)
        setPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [isLoaded, user])

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete post')
      setPosts(posts.filter((p) => p.id !== postId))
      if (selectedPostId === postId) {
        setSelectedPostId(null)
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const filteredPosts = posts.filter((p) => {
    if (activeTab === 'all') return true
    return p.status === activeTab
  })

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop: Sidebar */}
      {!isMobile && (
        <PostList
          posts={posts}
          isLoading={isLoading}
          selectedPostId={selectedPostId ?? undefined}
          onSelectPost={(post) => setSelectedPostId(post.id)}
          onDeletePost={handleDeletePost}
          onCreatePost={() => {
            // Would navigate to new post page
          }}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/10 bg-background/60 backdrop-blur-md px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">My Posts</h2>
          <Link href="/blog/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Posts with Tabs filter */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'draft' | 'published')} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full rounded-none border-b border-white/10 bg-transparent px-4 py-2">
            <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
            <TabsTrigger value="draft">Drafts ({posts.filter((p) => p.status === 'draft').length})</TabsTrigger>
            <TabsTrigger value="published">Published ({posts.filter((p) => p.status === 'published').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="flex-1 overflow-auto p-4">
            <div className="space-y-2">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No posts yet.{' '}
                  <Link href="/blog/new" className="text-primary hover:underline">
                    Create one
                  </Link>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostListItem
                    key={post.id}
                    post={post}
                    onDelete={handleDeletePost}
                    isSelected={selectedPostId === post.id}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="draft" className="flex-1 overflow-auto p-4">
            <div className="space-y-2">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No draft posts yet.{' '}
                  <Link href="/blog/new" className="text-primary hover:underline">
                    Create one
                  </Link>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostListItem
                    key={post.id}
                    post={post}
                    onDelete={handleDeletePost}
                    isSelected={selectedPostId === post.id}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="published" className="flex-1 overflow-auto p-4">
            <div className="space-y-2">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No published posts yet.
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostListItem
                    key={post.id}
                    post={post}
                    onDelete={handleDeletePost}
                    isSelected={selectedPostId === post.id}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
