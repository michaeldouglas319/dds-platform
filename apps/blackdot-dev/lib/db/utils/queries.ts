/**
 * Query Building Utilities
 *
 * Provides reusable patterns for pagination, filtering, and relation loading.
 * Eliminates hardcoded limits and scattered pagination logic.
 *
 * @example
 * const { limit, offset, page, pageSize } = withPagination({
 *   page: 1,
 *   pageSize: 20,
 * });
 * const posts = await db.select().from(posts).limit(limit).offset(offset);
 */

import { eq } from 'drizzle-orm';

/**
 * Options for pagination
 */
export interface PaginationOptions {
  /** Current page number (1-indexed) */
  page?: number;
  /** Items per page */
  pageSize?: number;
  /** Maximum allowed page size */
  maxPageSize?: number;
}

/**
 * Pagination metadata and query parameters
 */
export interface PaginationParams {
  /** SQL limit for database query */
  limit: number;
  /** SQL offset for database query */
  offset: number;
  /** Current page number */
  page: number;
  /** Items per page */
  pageSize: number;
}

/**
 * Paginated result with metadata
 */
export interface PaginatedResult<T> {
  /** Array of data items */
  data: T[];
  /** Pagination metadata */
  pagination: {
    /** Current page number */
    page: number;
    /** Items per page */
    pageSize: number;
    /** Total number of items */
    total: number;
    /** Total number of pages */
    totalPages: number;
  };
}

/**
 * Calculate pagination parameters for database queries
 *
 * Ensures valid page and pageSize values with sensible defaults.
 *
 * @param options - Pagination options
 * @returns Object with limit, offset, page, and pageSize
 *
 * @example
 * const { limit, offset } = withPagination({ page: 2, pageSize: 50 });
 * const posts = await db.select()
 *   .from(posts)
 *   .limit(limit)
 *   .offset(offset);
 */
export function withPagination(options: PaginationOptions = {}): PaginationParams {
  // Ensure page is at least 1
  const page = Math.max(1, options.page || 1);

  // Use provided pageSize, capped at maxPageSize
  const maxPageSize = options.maxPageSize || 100;
  const pageSize = Math.min(options.pageSize || 20, maxPageSize);

  // Calculate offset
  const offset = (page - 1) * pageSize;

  return {
    limit: pageSize,
    offset,
    page,
    pageSize,
  };
}

/**
 * Calculate total pages from count and page size
 *
 * @param total - Total number of items
 * @param pageSize - Items per page
 * @returns Total number of pages
 *
 * @example
 * const totalPages = getTotalPages(150, 20); // 8
 */
export function getTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

/**
 * Filter options for common query parameters
 */
export interface FilterOptions {
  /** Status field value */
  status?: string;
  /** User ID filter */
  userId?: string;
  /** Workspace ID filter */
  workspaceId?: string;
  /** Channel ID filter */
  channelId?: string;
  /** Search term (not used, for future full-text search) */
  search?: string;
  /** Tag array for filtering */
  tags?: string[];
}

/**
 * Standard user relation columns
 *
 * Used with Drizzle's `with` clause to load related user data.
 *
 * @example
 * const post = await db.query.posts.findFirst({
 *   where: eq(posts.id, postId),
 *   with: relationColumns.withAuthor,
 * });
 */
export const relationColumns = {
  /** User columns to load: id, email, firstName, lastName, avatarUrl */
  withAuthor: {
    author: {
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    },
  },

  /** Owner relation columns */
  withOwner: {
    owner: {
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    },
  },

  /** Creator relation columns */
  withCreator: {
    creator: {
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    },
  },
} as const;

/**
 * Standard user columns to select
 *
 * Used with Drizzle's `select` to limit columns returned.
 * Excludes sensitive fields and reduces payload size.
 *
 * @example
 * const users = await db.select({ ...userSelectColumns }).from(users);
 */
export const userSelectColumns = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  accessLevel: true,
  createdAt: true,
} as const;

/**
 * Build a paginated response
 *
 * Helper function to construct a standardized paginated response.
 *
 * @param data - Array of data items
 * @param total - Total number of items (before pagination)
 * @param page - Current page number
 * @param pageSize - Items per page
 * @returns Paginated result with metadata
 *
 * @example
 * const posts = await db.select().from(posts).limit(20).offset(0);
 * const result = buildPaginatedResponse(
 *   posts,
 *   totalPostCount,
 *   1,
 *   20
 * );
 */
export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: getTotalPages(total, pageSize),
    },
  };
}
