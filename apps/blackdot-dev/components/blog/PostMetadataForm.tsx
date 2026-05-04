'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { postMetadataSchema, generateSlug } from '@/lib/validation/blog.schema'
import { Post } from '@/lib/types/blog.types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ImageUpload } from './ImageUpload'
import { TagSelector } from './TagSelector'

interface PostMetadataFormProps {
  post?: Post
  onSubmit: (data: any) => void
  isLoading?: boolean
  availableTags?: string[]
}

/**
 * Post metadata form with title, slug, excerpt, and tags
 */
export function PostMetadataForm({
  post,
  onSubmit,
  isLoading,
  availableTags = [],
}: PostMetadataFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(postMetadataSchema),
    defaultValues: {
      title: post?.title || '',
      slug: post?.slug || '',
      excerpt: post?.excerpt || '',
      featuredImageUrl: post?.featuredImageUrl || '',
      tags: post?.tags || [],
    },
  })

  const title = watch('title')
  const tags = watch('tags')

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !post) {
      // Only auto-generate if creating new post (no post provided)
      const generatedSlug = generateSlug(title)
      setValue('slug', generatedSlug)
    }
  }, [title, post, setValue])

  const handleImageUpload = (url: string) => {
    setValue('featuredImageUrl', url)
  }

  const handleTagsChange = (newTags: string[]) => {
    setValue('tags', newTags)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title" className="block mb-2">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Post title"
          disabled={isLoading}
          {...register('title')}
        />
        {errors.title && (
          <p className="text-xs text-destructive mt-1">{errors.title.message as string}</p>
        )}
      </div>

      {/* Slug */}
      <div>
        <Label htmlFor="slug" className="block mb-2">
          Slug <span className="text-destructive">*</span>
        </Label>
        <Input
          id="slug"
          placeholder="post-slug"
          disabled={isLoading}
          {...register('slug')}
        />
        {errors.slug && (
          <p className="text-xs text-destructive mt-1">{errors.slug.message as string}</p>
        )}
      </div>

      {/* Excerpt */}
      <div>
        <Label htmlFor="excerpt" className="block mb-2">
          Excerpt
        </Label>
        <Textarea
          id="excerpt"
          placeholder="Brief summary of the post"
          disabled={isLoading}
          className="min-h-20"
          {...register('excerpt')}
        />
        {errors.excerpt && (
          <p className="text-xs text-destructive mt-1">{errors.excerpt.message as string}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Max 500 characters
        </p>
      </div>

      {/* Featured Image */}
      <div>
        <Label className="block mb-2">Featured Image</Label>
        <ImageUpload
          onUpload={handleImageUpload}
          isLoading={isLoading}
          previewUrl={post?.featuredImageUrl}
        />
      </div>

      {/* Tags */}
      <div>
        <Label className="block mb-2">Tags</Label>
        <TagSelector
          selectedTags={tags}
          onTagsChange={handleTagsChange}
          availableTags={availableTags}
          isLoading={isLoading}
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : 'Save Metadata'}
      </Button>
    </form>
  )
}
