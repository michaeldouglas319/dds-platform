/**
 * Authentication and Authorization Utilities for API Routes
 *
 * Use these functions in:
 * - API routes (app/api/**\/route.ts)
 * - Server Actions
 *
 * For Server Components, use /lib/auth.ts instead.
 * These helpers automatically benefit from request-level caching via React.cache().
 *
 * All functions throw HTTP-friendly errors (AppError) for API responses:
 * - UnauthorizedError (401): User not authenticated
 * - ForbiddenError (403): User lacks required permissions
 * - NotFoundError (404): Resource not found
 *
 * @example
 * const userId = await requireAuth();
 * await requireOwnership(post, userId, 'post');
 */

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { workspaceMembers, channelMembers } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { UnauthorizedError, ForbiddenError, NotFoundError } from './errors';

/**
 * Require authenticated user or throw UnauthorizedError
 *
 * Replaces the repeated pattern:
 * ```typescript
 * const { userId } = await auth();
 * if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
 * ```
 *
 * @returns Authenticated user ID
 * @throws UnauthorizedError if user is not authenticated
 *
 * @example
 * const userId = await requireAuth();
 * // userId is guaranteed to be string at this point
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }
  return userId;
}

/**
 * Generic type for resources with owner/author fields
 */
interface OwnableResource {
  authorId?: string;
  ownerId?: string;
  userId?: string;
}

/**
 * Verify user owns the resource or throw ForbiddenError
 *
 * Replaces the repeated pattern:
 * ```typescript
 * if (!resource) return Response.json({ error: 'Not found' }, { status: 404 });
 * if (resource.authorId !== userId) {
 *   return Response.json({ error: 'Forbidden' }, { status: 403 });
 * }
 * ```
 *
 * @param resource - The resource to check ownership of
 * @param userId - User ID to verify
 * @param resourceType - Display name for error messages (e.g., 'post', 'workspace')
 * @returns The resource (for chaining)
 * @throws NotFoundError if resource is null
 * @throws ForbiddenError if user is not the owner
 *
 * @example
 * const post = await db.query.posts.findFirst(...);
 * await requireOwnership(post, userId, 'post');
 */
export async function requireOwnership<T extends OwnableResource>(
  resource: T | null,
  userId: string,
  resourceType: string = 'resource'
): Promise<T> {
  if (!resource) {
    throw new NotFoundError(`${resourceType} not found`);
  }

  const ownerId = resource.authorId || resource.ownerId || resource.userId;
  if (ownerId !== userId) {
    throw new ForbiddenError(`You can only modify your own ${resourceType}`);
  }

  return resource;
}

/**
 * Verify user is a member of the workspace or throw ForbiddenError
 *
 * Replaces the repeated pattern:
 * ```typescript
 * const membership = await db.query.workspaceMembers.findFirst({
 *   where: and(
 *     eq(workspaceMembers.workspaceId, workspaceId),
 *     eq(workspaceMembers.userId, userId)
 *   ),
 * });
 * if (!membership) {
 *   throw new ForbiddenError('Not a member of this workspace');
 * }
 * ```
 *
 * @param workspaceId - Workspace ID to check membership
 * @param userId - User ID to verify
 * @returns true if user is a member
 * @throws ForbiddenError if user is not a member
 *
 * @example
 * await requireWorkspaceMember(workspaceId, userId);
 */
export async function requireWorkspaceMember(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const membership = await db.query.workspaceMembers.findFirst({
    where: and(
      eq(workspaceMembers.workspaceId, workspaceId),
      eq(workspaceMembers.userId, userId)
    ),
  });

  if (!membership) {
    throw new ForbiddenError('Not a member of this workspace');
  }

  return true;
}

/**
 * Verify user is a member of the channel or throw ForbiddenError
 *
 * Similar to requireWorkspaceMember but for channels
 *
 * @param channelId - Channel ID to check membership
 * @param userId - User ID to verify
 * @returns true if user is a member
 * @throws ForbiddenError if user is not a member
 *
 * @example
 * await requireChannelMember(channelId, userId);
 */
export async function requireChannelMember(
  channelId: string,
  userId: string
): Promise<boolean> {
  const membership = await db.query.channelMembers.findFirst({
    where: and(
      eq(channelMembers.channelId, channelId),
      eq(channelMembers.userId, userId)
    ),
  });

  if (!membership) {
    throw new ForbiddenError('Not a member of this channel');
  }

  return true;
}

/**
 * Verify user has specific access level (if implemented)
 * Placeholder for future role-based access control
 *
 * @param userId - User ID to check
 * @param requiredLevel - Required access level
 * @returns true if user has required access level
 * @throws ForbiddenError if user lacks access
 *
 * @example
 * await requireAccessLevel(userId, 'admin');
 */
export async function requireAccessLevel(
  userId: string,
  requiredLevel: string
): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: (u) => eq(u.id, userId),
  });

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  // TODO: Implement access level checking based on user.accessLevel
  // For now, just ensure user exists
  return true;
}
