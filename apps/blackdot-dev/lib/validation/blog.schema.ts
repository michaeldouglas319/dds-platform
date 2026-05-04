import { z } from 'zod'

/**
 * Blog post metadata form validation schema
 */
export const postMetadataSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  excerpt: z
    .string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  featuredImageUrl: z
    .string()
    .url('Featured image must be a valid URL')
    .optional()
    .or(z.literal('')),
  tags: z.array(z.string()).default([]),
})

export type PostMetadataFormData = z.infer<typeof postMetadataSchema>

/**
 * Complete post creation/update schema
 */
export const createPostSchema = postMetadataSchema.extend({
  content: z.record(z.any()),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
})

export type CreatePostData = z.infer<typeof createPostSchema>

/**
 * Post update schema (includes post ID)
 */
export const updatePostSchema = createPostSchema.extend({
  id: z.string(),
  changeDescription: z.string().optional(),
})

export type UpdatePostData = z.infer<typeof updatePostSchema>

/**
 * Tag creation/update schema
 */
export const tagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name must be less than 50 characters'),
  slug: z
    .string()
    .min(1, 'Tag slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Tag slug must be lowercase with hyphens only'),
})

export type TagData = z.infer<typeof tagSchema>

/**
 * Post list filter schema
 */
export const postListFilterSchema = z.object({
  status: z.enum(['all', 'draft', 'published', 'archived']).default('all'),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'viewCount']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
})

export type PostListFilter = z.infer<typeof postListFilterSchema>

/**
 * Slug generation/validation helper
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

/**
 * Validate post slug uniqueness (to be used with server-side validation)
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

/**
 * Validate tag name
 */
export function isValidTagName(name: string): boolean {
  return name.length > 0 && name.length <= 50
}

/**
 * Validate excerpt length
 */
export function isValidExcerpt(excerpt: string): boolean {
  return excerpt.length <= 500
}
