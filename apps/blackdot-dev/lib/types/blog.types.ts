/**
 * Blog system types
 * Defines TypeScript interfaces for blog-related entities
 */

// JSONContent type - placeholder if @tiptap/react is not available
type JSONContent = Record<string, any>

export type PostStatus = 'draft' | 'published' | 'archived'

export interface User {
  id: string
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  accessLevel: string
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  id: string
  title: string
  slug: string
  content: JSONContent
  excerpt?: string
  status: PostStatus
  authorId: string
  author?: User
  featuredImageUrl?: string
  tags: string[]
  viewCount: number
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export interface PostVersion {
  id: string
  postId: string
  content: JSONContent
  title: string
  excerpt?: string
  changeDescription?: string
  authorId: string
  author?: User
  createdAt: Date
}

export interface PostTag {
  id: string
  name: string
  slug: string
  postCount: number
  createdAt: Date
}

// Component prop types
export interface PostListProps {
  posts: Post[]
  isLoading: boolean
  onSelectPost?: (post: Post) => void
  onDeletePost?: (postId: string) => void
  filter?: 'all' | 'draft' | 'published' | 'archived'
}

export interface PostListItemProps {
  post: Post
  onSelect?: (post: Post) => void
  onDelete?: (postId: string) => void
  isSelected?: boolean
}

export interface PostEditorProps {
  post?: Post
  isLoading?: boolean
  onSave: (data: CreatePostPayload) => Promise<void>
  onPublish: (data: CreatePostPayload) => Promise<void>
  onCancel?: () => void
}

export interface EditorToolbarProps {
  onBold?: () => void
  onItalic?: () => void
  onHeading?: (level: 1 | 2 | 3) => void
  onBulletList?: () => void
  onOrderedList?: () => void
  onBlockquote?: () => void
  onCode?: () => void
  onLink?: () => void
  onImage?: () => void
}

export interface PostMetadataFormProps {
  defaultValues?: Partial<Post>
  onSubmit: (data: PostMetadataFormData) => void
  isLoading?: boolean
}

export interface ImageUploadProps {
  onUpload: (url: string) => void
  onError?: (error: Error) => void
  isLoading?: boolean
}

export interface VersionHistoryProps {
  versions: PostVersion[]
  onSelectVersion?: (version: PostVersion) => void
  onRevert?: (version: PostVersion) => void
  isLoading?: boolean
}

export interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  availableTags?: string[]
  isLoading?: boolean
}

// Form data types
export interface PostMetadataFormData {
  title: string
  slug: string
  excerpt?: string
  featuredImageUrl?: string
  tags: string[]
}

export interface CreatePostPayload {
  title: string
  slug: string
  content: JSONContent
  excerpt?: string
  featuredImageUrl?: string
  status: PostStatus
  tags: string[]
}

export interface UpdatePostPayload extends CreatePostPayload {
  id: string
  changeDescription?: string
}

// API Response types
export interface PostListResponse {
  posts: Post[]
  total: number
  page: number
  pageSize: number
}

export interface PostDetailResponse {
  post: Post
  versions: PostVersion[]
}
