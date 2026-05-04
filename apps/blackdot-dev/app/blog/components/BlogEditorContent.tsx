'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Post } from '@/lib/types/blog.types'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BlogEditorContentProps {
  post?: Post
  isNew?: boolean
}

/**
 * Blog editor content component for creating/editing posts
 */
export function BlogEditorContent({ post, isNew = true }: BlogEditorContentProps) {
  const router = useRouter()
  const { user, isLoaded } = useUser()

  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [currentTab, setCurrentTab] = useState<'editor' | 'metadata'>('editor')

  // Store form data
  const [content, setContent] = useState('')
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    featuredImageUrl: post?.featuredImageUrl || '',
    tags: post?.tags || [],
  })

  const handleSaveWithStatus = useCallback(
    async (status: 'draft' | 'published') => {
      const isPublishAction = status === 'published'
      isPublishAction ? setIsPublishing(true) : setIsSaving(true)

      try {
        // Validate required fields
        if (!formData.title.trim()) {
          alert('Title is required')
          setCurrentTab('metadata')
          return
        }
        if (!formData.slug.trim()) {
          alert('Slug is required')
          setCurrentTab('metadata')
          return
        }
        if (!content.trim()) {
          alert('Content is required')
          setCurrentTab('editor')
          return
        }

        // Convert plain text content to Tiptap format
        let parsedContent: any
        try {
          parsedContent = JSON.parse(content)
        } catch {
          parsedContent = {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: content }],
              },
            ],
          }
        }

        const payload: any = {
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          content: parsedContent,
          status,
        }

        // Add optional fields only if they have values
        if (formData.excerpt?.trim()) {
          payload.excerpt = formData.excerpt.trim()
        }
        if (formData.tags?.length > 0) {
          payload.tags = formData.tags
        }
        if (formData.featuredImageUrl?.trim()) {
          payload.featuredImageUrl = formData.featuredImageUrl.trim()
        }

        console.log('Sending payload:', payload)

        const response = await fetch(
          post ? `/api/posts/${post.id}` : '/api/posts',
          {
            method: post ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        )

        if (!response.ok) {
          let errorMessage = 'Failed to save post'
          try {
            const errorData = await response.json()
            console.error('API error response:', errorData)
            errorMessage = errorData.error || errorMessage
          } catch {
            console.error('Failed to parse error response:', response.status, response.statusText)
            errorMessage = `Server error: ${response.statusText}`
          }
          throw new Error(errorMessage)
        }

        console.log('Post saved successfully')

        router.push('/blog')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save post'
        console.error('Failed to save post:', errorMessage)
        alert(`Error: ${errorMessage}`)
      } finally {
        isPublishAction ? setIsPublishing(false) : setIsSaving(false)
      }
    },
    [formData, content, post, router]
  )

  const handleMetadataChange = useCallback(
    (data: any) => {
      setFormData({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || '',
        featuredImageUrl: data.featuredImageUrl || '',
        tags: data.tags || [],
      })
    },
    []
  )

  const handleEditorSave = useCallback(async () => {
    await handleSaveWithStatus('draft')
  }, [handleSaveWithStatus])

  const handleEditorPublish = useCallback(async () => {
    await handleSaveWithStatus('published')
  }, [handleSaveWithStatus])

  const handleEditorContentChange = useCallback((newContent: string) => {
    setContent(newContent)
  }, [])

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/10 bg-background/60 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-lg font-semibold text-foreground">
            {formData.title ? formData.title : 'New Post'}
          </h2>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2">
          <Button
            variant={currentTab === 'editor' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTab('editor')}
          >
            Editor
          </Button>
          <Button
            variant={currentTab === 'metadata' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentTab('metadata')}
          >
            Metadata
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {currentTab === 'editor' ? (
          <PostEditorWrapper
            content={content}
            onContentChange={handleEditorContentChange}
            onSave={handleEditorSave}
            onPublish={handleEditorPublish}
            onCancel={() => router.push('/blog')}
            isLoading={isSaving || isPublishing}
          />
        ) : (
          <div className="p-4 h-full overflow-auto">
            <PostMetadataFormWrapper
              formData={formData}
              onChange={handleMetadataChange}
              isLoading={isSaving || isPublishing}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Wrapper to pass content state to PostEditor
 */
function PostEditorWrapper({
  content,
  onContentChange,
  onSave,
  onPublish,
  onCancel,
  isLoading,
}: {
  content: string
  onContentChange: (content: string) => void
  onSave: () => Promise<void>
  onPublish: () => Promise<void>
  onCancel: () => void
  isLoading: boolean
}) {
  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="flex-1 flex flex-col min-h-0">
        <label className="text-sm font-medium mb-2">Content</label>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Write your post content here..."
          className="flex-1 resize-none p-3 rounded-md border border-white/10 bg-background/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Currently using plain text. Rich editor with formatting toolbar coming soon.
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="outline" onClick={onSave} disabled={isLoading} className="flex-1">
          {isLoading ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button onClick={onPublish} disabled={isLoading} className="flex-1">
          {isLoading ? 'Publishing...' : 'Publish'}
        </Button>
      </div>
    </div>
  )
}

/**
 * Wrapper to pass form data to PostMetadataForm
 */
function PostMetadataFormWrapper({
  formData,
  onChange,
  isLoading,
}: {
  formData: any
  onChange: (data: any) => void
  isLoading: boolean
}) {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...formData,
      [field]: value,
    })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Title */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Title <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Post title"
          className="w-full px-3 py-2 rounded-md border border-white/10 bg-background/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
      </div>

      {/* Slug */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Slug <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
          placeholder="post-slug"
          className="w-full px-3 py-2 rounded-md border border-white/10 bg-background/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Only lowercase letters, numbers, and hyphens allowed
        </p>
      </div>

      {/* Excerpt */}
      <div>
        <label className="text-sm font-medium mb-2 block">Excerpt</label>
        <textarea
          value={formData.excerpt}
          onChange={(e) => handleChange('excerpt', e.target.value)}
          placeholder="Brief summary of the post"
          className="w-full px-3 py-2 rounded-md border border-white/10 bg-background/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-20"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground mt-1">Max 500 characters</p>
      </div>
    </div>
  )
}
