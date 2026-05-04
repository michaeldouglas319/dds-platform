'use client'

import { useState, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Post } from '@/lib/types/blog.types'

interface PostEditorProps {
  post?: Post
  isLoading?: boolean
  onSave: (data: any) => Promise<void>
  onPublish?: (data: any) => Promise<void>
  onCancel?: () => void
}

/**
 * Rich text blog post editor
 * Note: Tiptap integration to be implemented when packages are installed
 */
export function PostEditor({
  post,
  isLoading,
  onSave,
  onPublish,
  onCancel,
}: PostEditorProps) {
  // Initialize content - handle both plain text and JSON
  const [content, setContent] = useState(() => {
    if (!post?.content) return ''
    if (typeof post.content === 'string') return post.content
    // If it's a JSON object (Tiptap), stringify it
    return typeof post.content === 'object' ? JSON.stringify(post.content, null, 2) : ''
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      // Try to parse as JSON, fall back to plain text
      let parsedContent: any
      try {
        parsedContent = content ? JSON.parse(content) : {}
      } catch {
        // If not valid JSON, treat as plain text
        parsedContent = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: content }] }] }
      }
      await onSave({ content: parsedContent })
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }, [content, onSave])

  const handlePublish = useCallback(async () => {
    setIsSaving(true)
    try {
      // Try to parse as JSON, fall back to plain text
      let parsedContent: any
      try {
        parsedContent = content ? JSON.parse(content) : {}
      } catch {
        // If not valid JSON, treat as plain text
        parsedContent = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: content }] }] }
      }
      await onPublish?.({ content: parsedContent })
    } catch (error) {
      console.error('Failed to publish:', error)
    } finally {
      setIsSaving(false)
    }
  }, [content, onPublish])

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Editor */}
      <div className="flex-1 flex flex-col min-h-0">
        <label className="text-sm font-medium mb-2">Content</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content here... (Tiptap editor coming soon)"
          className="flex-1 resize-none"
          disabled={isLoading || isSaving}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Currently using plain text. Rich editor with formatting toolbar coming soon.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isLoading || isSaving}>
            Cancel
          </Button>
        )}
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={isLoading || isSaving}
          className="flex-1"
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        {onPublish && (
          <Button
            onClick={handlePublish}
            disabled={isLoading || isSaving}
            className="flex-1"
          >
            {isSaving ? 'Publishing...' : 'Publish'}
          </Button>
        )}
      </div>
    </div>
  )
}
