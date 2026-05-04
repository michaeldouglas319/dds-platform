/**
 * Post Service - Business Logic for Post Operations
 *
 * Centralizes all post-related database operations and business rules.
 * This replaces scattered logic that was duplicated across routes.
 *
 * All operations throw AppError on failure - routes handle converting to HTTP responses.
 *
 * @example
 * const post = await postService.create(userId, {
 *   title: 'My Post',
 *   slug: 'my-post',
 *   content: { ... },
 * });
 */

import { db } from '@/lib/db';
import { posts, postVersions } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import {
  ensureUserExists,
  idGenerators,
  requireOwnership,
  withPagination,
  buildPaginatedResponse,
  relationColumns,
  withTransaction,
  ConflictError,
  NotFoundError,
} from '@/lib/db/utils';
import type {
  CreatePostParams,
  UpdatePostParams,
  ListPostsParams,
  PostResponse,
  PostListResponse,
} from '@/app/api/types';

/**
 * Post service - all post operations
 */
export const postService = {
  /**
   * Create a new post with initial version
   *
   * This is an atomic operation: either both post and version are created,
   * or neither are created if an error occurs.
   *
   * @param userId - Author's user ID
   * @param params - Post creation parameters
   * @returns Created post with author information
   * @throws ConflictError if slug already exists
   * @throws Error if database operation fails
   *
   * @example
   * const post = await postService.create(userId, {
   *   title: 'My First Post',
   *   slug: 'my-first-post',
   *   content: { type: 'doc', content: [...] },
   *   status: 'draft',
   * });
   */
  async create(userId: string, params: CreatePostParams): Promise<PostResponse> {
    // Ensure user exists in database (auto-sync from Clerk if needed)
    await ensureUserExists(userId);

    // Check if slug already exists
    const existingSlug = await db.query.posts.findFirst({
      where: eq(posts.slug, params.slug),
    });

    if (existingSlug) {
      throw new ConflictError('Slug already exists');
    }

    // Create post and initial version in a transaction
    return await withTransaction(async (tx) => {
      const postId = idGenerators.post();
      const publishedAt = params.status === 'published' ? new Date() : null;

      // Insert post
      await (tx as typeof db).insert(posts).values({
        id: postId,
        title: params.title,
        slug: params.slug,
        content: params.content,
        excerpt: params.excerpt || null,
        authorId: userId,
        status: (params.status as any) || 'draft',
        tags: params.tags?.length ? params.tags : null,
        featuredImageUrl: params.featuredImageUrl || null,
        publishedAt,
      });

      // Create initial version
      const versionId = idGenerators.postVersion();
      await (tx as typeof db).insert(postVersions).values({
        id: versionId,
        postId,
        version: 1,
        title: params.title,
        content: params.content,
        createdBy: userId,
        changesSummary: 'Initial version',
      });

      // Fetch and return created post with author
      const createdPost = await (tx as typeof db).query.posts.findFirst({
        where: eq(posts.id, postId),
        with: relationColumns.withAuthor,
      });

      if (!createdPost) {
        throw new Error('Failed to retrieve created post');
      }

      // Note: Type mismatch between author array from query and single author in response
      // Using any to work around this
      return createdPost as any as PostResponse;
    });
  },

  /**
   * List posts with pagination and filtering
   *
   * Supports two modes:
   * - myDrafts: Get user's own draft and published posts
   * - published: Get published posts from all users
   *
   * @param params - List parameters
   * @returns Paginated list of posts with pagination metadata
   * @throws Error if database operation fails
   *
   * @example
   * // Get user's drafts
   * const result = await postService.list({
   *   userId,
   *   myDrafts: true,
   *   page: 1,
   *   pageSize: 20,
   * });
   *
   * // Get published posts
   * const result = await postService.list({
   *   status: 'published',
   *   page: 1,
   *   pageSize: 50,
   * });
   */
  async list(params: ListPostsParams): Promise<PostListResponse> {
    const { limit, offset, page, pageSize } = withPagination({
      page: params.page,
      pageSize: params.pageSize,
    });

    // Build query based on filter
    const query = params.myDrafts && params.userId
      ? db
        .select()
        .from(posts)
        .where(eq(posts.authorId, params.userId))
        .orderBy(desc(posts.createdAt))
      : db
        .select()
        .from(posts)
        .where(eq(posts.status, (params.status as any) || 'published'))
        .orderBy(desc(posts.publishedAt));

    // Fetch posts with pagination
    const data = await query.limit(limit).offset(offset);

    // Get total count for pagination
    const countQuery = params.myDrafts && params.userId
      ? db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(eq(posts.authorId, params.userId))
      : db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(eq(posts.status, (params.status as any) || 'published'));

    const [{ count }] = await countQuery;

    return buildPaginatedResponse(
      data as PostResponse[],
      Number(count),
      page,
      pageSize
    );
  },

  /**
   * Get a single post by ID
   *
   * @param postId - Post ID
   * @returns Post with author information
   * @throws NotFoundError if post not found
   *
   * @example
   * const post = await postService.getById(postId);
   */
  async getById(postId: string): Promise<PostResponse> {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      with: relationColumns.withAuthor,
    });

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Note: Type mismatch between author array from query and single author in response
    // Using any to work around this
    return post as any as PostResponse;
  },

  /**
   * Update a post and create a new version
   *
   * Creates a new version entry whenever content changes.
   * Only the user who created the post can update it.
   *
   * @param postId - Post ID
   * @param userId - User ID (must be the author)
   * @param params - Update parameters
   * @returns Updated post with author information
   * @throws NotFoundError if post not found
   * @throws ForbiddenError if user doesn't own the post
   * @throws ConflictError if new slug already exists
   *
   * @example
   * const updated = await postService.update(postId, userId, {
   *   title: 'Updated Title',
   *   content: { ... },
   *   changeDescription: 'Fixed typos',
   * });
   */
  async update(
    postId: string,
    userId: string,
    params: UpdatePostParams
  ): Promise<PostResponse> {
    // Get existing post
    const existing = await this.getById(postId);

    // Check ownership
    await requireOwnership(existing, userId, 'post');

    // Check slug uniqueness if changed
    if (params.slug && params.slug !== existing.slug) {
      const slugExists = await db.query.posts.findFirst({
        where: eq(posts.slug, params.slug),
      });

      if (slugExists) {
        throw new ConflictError('Slug already exists');
      }
    }

    // Update post and create version in transaction
    return await withTransaction(async (tx) => {
      // Build update data
      const updateData: any = { updatedAt: new Date() };
      if (params.title !== undefined) updateData.title = params.title;
      if (params.slug !== undefined) updateData.slug = params.slug;
      if (params.excerpt !== undefined) updateData.excerpt = params.excerpt || null;
      if (params.content !== undefined) updateData.content = params.content;
      if (params.status !== undefined) updateData.status = params.status;
      if (params.tags !== undefined) updateData.tags = params.tags?.length ? params.tags : null;
      if (params.featuredImageUrl !== undefined)
        updateData.featuredImageUrl = params.featuredImageUrl || null;
      if (params.status === 'published' && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }

      // Update post
      await (tx as typeof db)
        .update(posts)
        .set(updateData)
        .where(eq(posts.id, postId));

      // Create new version if content changed
      if (params.content !== undefined) {
        const lastVersion = await (tx as typeof db).query.postVersions.findFirst({
          where: eq(postVersions.postId, postId),
          orderBy: desc(postVersions.version),
        });

        const nextVersion = (lastVersion?.version || 0) + 1;
        const versionId = idGenerators.postVersion();

        await (tx as typeof db).insert(postVersions).values({
          id: versionId,
          postId,
          version: nextVersion,
          title: params.title || existing.title,
          content: params.content,
          createdBy: userId,
          changesSummary: params.changeDescription || 'Updated',
        });
      }

      // Return updated post
      const updatedPost = await (tx as typeof db).query.posts.findFirst({
        where: eq(posts.id, postId),
        with: relationColumns.withAuthor,
      });

      if (!updatedPost) {
        throw new Error('Failed to retrieve updated post');
      }

      // Note: Type mismatch between author array from query and single author in response
      // Using any to work around this
      return updatedPost as any as PostResponse;
    });
  },

  /**
   * Delete a post
   *
   * Deletes the post and all related data (versions, comments) via cascade.
   * Only the author can delete their own posts.
   *
   * @param postId - Post ID
   * @param userId - User ID (must be the author)
   * @returns Success confirmation
   * @throws NotFoundError if post not found
   * @throws ForbiddenError if user doesn't own the post
   *
   * @example
   * const result = await postService.delete(postId, userId);
   * console.log(result.success); // true
   */
  async delete(postId: string, userId: string): Promise<{ success: true }> {
    // Get existing post
    const existing = await this.getById(postId);

    // Check ownership
    await requireOwnership(existing, userId, 'post');

    // Delete post (cascades to versions and comments)
    await db.delete(posts).where(eq(posts.id, postId));

    return { success: true };
  },
};
