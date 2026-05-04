/**
 * Post API Type Definitions
 *
 * Defines all request, response, and parameter types for post operations.
 * Provides type safety for API routes and services.
 */

// JSONContent type for Tiptap editor content
type JSONContent = any;

/**
 * Post status enum
 */
export type PostStatus = 'draft' | 'published' | 'archived';

/**
 * Request: Create a new post
 */
export interface CreatePostRequest {
  title: string;
  slug: string;
  content: JSONContent;
  excerpt?: string;
  status?: PostStatus;
  tags?: string[];
  featuredImageUrl?: string;
}

/**
 * Request: Update an existing post
 */
export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  changeDescription?: string;
}

/**
 * Query parameters: List posts
 */
export interface ListPostsQuery {
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Filter by status */
  status?: PostStatus;
  /** Get user's drafts */
  myDrafts?: boolean;
}

/**
 * Service params: Create post
 */
export interface CreatePostParams {
  title: string;
  slug: string;
  content: JSONContent;
  excerpt?: string;
  status?: PostStatus;
  tags?: string[];
  featuredImageUrl?: string;
}

/**
 * Service params: Update post
 */
export interface UpdatePostParams extends Partial<CreatePostParams> {
  changeDescription?: string;
}

/**
 * Service params: List posts
 */
export interface ListPostsParams {
  userId?: string;
  status?: PostStatus;
  myDrafts?: boolean;
  page?: number;
  pageSize?: number;
}

/**
 * Response: Single post with author
 */
export interface PostResponse {
  id: string;
  title: string;
  slug: string;
  content: JSONContent;
  excerpt?: string;
  status: PostStatus;
  authorId: string;
  author?: AuthorResponse;
  featuredImageUrl?: string;
  tags?: string[];
  viewCount?: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

/**
 * Response: Author information
 */
export interface AuthorResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

/**
 * Response: Post version
 */
export interface PostVersionResponse {
  id: string;
  postId: string;
  version: number;
  title: string;
  content: JSONContent;
  createdBy: string;
  changesSummary?: string;
  createdAt: Date;
}

/**
 * Response: Paginated posts list
 */
export interface PostListResponse {
  data: PostResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Response: Post detail with versions
 */
export interface PostDetailResponse {
  post: PostResponse;
  versions: PostVersionResponse[];
}
