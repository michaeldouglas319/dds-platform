/**
 * User Synchronization from Clerk to PostgreSQL
 *
 * Ensures that Clerk users are synced to the PostgreSQL database.
 * This is called before creating resources that reference users.
 *
 * Replaces the 30-line try/catch block that was duplicated in every create route.
 *
 * @example
 * const userId = await requireAuth();
 * await ensureUserExists(userId);
 * await db.insert(posts).values({ authorId: userId, ... });
 */

import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { ConflictError } from './errors';
import { AccessLevel, type AccessLevelType } from '@/lib/types/auth.types';

/**
 * Ensure a Clerk user exists in the PostgreSQL database
 *
 * If the user doesn't exist in the database, fetches their info from Clerk
 * and inserts them. Handles race conditions gracefully.
 *
 * Call this before creating any resource that references a user.
 *
 * @param userId - Clerk user ID
 * @throws Error if Clerk API call fails (other than duplicate user)
 *
 * @example
 * // Before creating a post:
 * await ensureUserExists(userId);
 * await db.insert(posts).values({
 *   id: 'post_123',
 *   authorId: userId,
 *   title: 'My Post',
 *   content: '...',
 * });
 */
export async function ensureUserExists(userId: string): Promise<void> {
  try {
    // Check if user already exists in database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // User already exists, nothing to do
    if (existingUser) {
      return;
    }

    // Fetch user from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    // Check if this is the first user → make them ADMIN
    const allUsers = await db.query.users.findMany({ limit: 1 });
    const isFirstUser = allUsers.length === 0;
    const accessLevel = isFirstUser ? AccessLevel.ADMIN : AccessLevel.MEMBER_PLUS;

    // Insert user into database
    await db.insert(users).values({
      id: userId,
      clerkId: userId,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || 'unknown@example.com',
      firstName: clerkUser.firstName || null,
      lastName: clerkUser.lastName || null,
      avatarUrl: clerkUser.imageUrl || null,
      accessLevel: accessLevel,
    });

    // CRITICAL: Also update Clerk public metadata for JWT
    // This makes the role available in middleware without database calls
    await client.users.updateUser(userId, {
      publicMetadata: {
        accessLevel: accessLevel,
      },
    });

    console.log(`Auto-synced Clerk user ${userId} to database (access: ${accessLevel})`);
  } catch (error: any) {
    // Handle race condition where user was already inserted
    if (error?.message?.includes('duplicate')) {
      console.log(`User ${userId} already exists (race condition handled)`);
      return;
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Batch sync multiple users from Clerk to database
 *
 * Useful for operations that affect multiple users.
 *
 * @param userIds - Array of Clerk user IDs to sync
 * @returns Array of synced user IDs
 *
 * @example
 * const userIds = ['user_123', 'user_456', 'user_789'];
 * await batchEnsureUsersExist(userIds);
 */
export async function batchEnsureUsersExist(userIds: string[]): Promise<void> {
  // Remove duplicates
  const uniqueIds = [...new Set(userIds)];

  // Sync each user (they're independent operations)
  await Promise.all(uniqueIds.map((id) => ensureUserExists(id)));
}

/**
 * Get or create a user, returning the database user object
 *
 * Ensures the user exists and returns their database record.
 *
 * @param userId - Clerk user ID
 * @returns User object from database
 * @throws UnauthorizedError if user not found in Clerk
 *
 * @example
 * const user = await getOrSyncUser(userId);
 * console.log(user.email, user.firstName);
 */
export async function getOrSyncUser(userId: string) {
  await ensureUserExists(userId);

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new ConflictError('Failed to sync user');
  }

  return user;
}

/**
 * Update user profile from Clerk
 *
 * Syncs user profile changes from Clerk to the database.
 * Useful when Clerk user info changes (avatar, name, email).
 *
 * @param userId - Clerk user ID
 * @throws Error if user not found or update fails
 *
 * @example
 * // Call this in Clerk webhook or periodically
 * await syncUserProfile(userId);
 */
export async function syncUserProfile(userId: string): Promise<void> {
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    await db
      .update(users)
      .set({
        email: clerkUser.emailAddresses?.[0]?.emailAddress || 'unknown@example.com',
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
        avatarUrl: clerkUser.imageUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    console.log(`Synced profile for user ${userId}`);
  } catch (error) {
    console.error(`Failed to sync profile for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Create user from Clerk on-demand (when auto-sync fails)
 *
 * Handles edge case where:
 * - User authenticated by Clerk ✅ (userId exists)
 * - Webhook hasn't fired or failed ❌
 * - getUserRole() finds no database record
 *
 * Fetches full user from Clerk API and creates database record.
 * Always assigns MEMBER role (admins manually assigned by admins).
 *
 * Called when:
 * 1. Race condition - user navigates before webhook completes
 * 2. Webhook failure - network error, database timeout
 * 3. Manual deletion - DB record deleted but session valid
 * 4. Webhook not configured - missing in Clerk dashboard
 *
 * @param clerkUserId - Clerk user ID
 * @returns Object with created user, access level, and creation flag
 * @throws Error if Clerk API fails or database insert fails
 *
 * @example
 * const result = await createUserFromClerk(userId);
 * return result.accessLevel; // MEMBER (safe default)
 */
export async function createUserFromClerk(clerkUserId: string) {
  try {
    // Get Clerk client and fetch user
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);

    // Check if this is the first user → make them ADMIN
    const allUsers = await db.query.users.findMany({ limit: 1 });
    const isFirstUser = allUsers.length === 0;

    const accessLevel = isFirstUser ? AccessLevel.ADMIN : AccessLevel.MEMBER_PLUS;

    // Create database record with Clerk data
    const newUser = await db.insert(users).values({
      id: clerkUser.id,
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || 'unknown@example.com',
      firstName: clerkUser.firstName || null,
      lastName: clerkUser.lastName || null,
      avatarUrl: clerkUser.imageUrl || null,
      accessLevel: accessLevel,
    }).returning();

    // CRITICAL: Also update Clerk public metadata for JWT
    // This makes the role available in middleware without database calls
    await client.users.updateUser(clerkUser.id, {
      publicMetadata: {
        accessLevel: accessLevel,
      },
    });

    console.warn(`⚠️ User ${clerkUserId} created on-demand (webhook may have failed)`, {
      email: clerkUser.emailAddresses?.[0]?.emailAddress,
      accessLevel,
      isFirstUser,
      timestamp: new Date().toISOString(),
    });

    return {
      user: newUser[0],
      accessLevel: accessLevel,
      wasCreatedOnDemand: true,
    };
  } catch (error: any) {
    // Handle race condition where user was already inserted
    if (error?.message?.includes('duplicate') || error?.code === '23505') {
      console.log(`User ${clerkUserId} already exists (race condition handled)`);
      // Try to fetch the existing user
      const existing = await db.query.users.findFirst({
        where: eq(users.id, clerkUserId),
      });
      if (existing) {
        return {
          user: existing,
          accessLevel: (existing.accessLevel as any) || AccessLevel.MEMBER_PLUS,
          wasCreatedOnDemand: false,
        };
      }
    }

    console.error(`❌ Failed to create user from Clerk: ${clerkUserId}`, error);
    throw error;
  }
}

/**
 * Update user role and sync to Clerk metadata
 *
 * CRITICAL: Updates both database and Clerk public metadata.
 * Without metadata sync, middleware will still see old role until JWT expires.
 *
 * @param userId - Clerk user ID
 * @param newRole - New access level to assign
 * @throws Error if user not found or update fails
 *
 * @example
 * // Admin changes user role
 * await updateUserRole('user_123', AccessLevel.ADMIN);
 * // User must refresh page to get new JWT with updated role
 */
export async function updateUserRole(userId: string, newRole: AccessLevelType): Promise<void> {
  try {
    // Update database
    await db
      .update(users)
      .set({
        accessLevel: newRole,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // CRITICAL: Update Clerk metadata (for middleware)
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        accessLevel: newRole,
      },
    });

    console.log(`Updated user ${userId} role to ${newRole}`);
    console.warn(`⚠️ User must refresh page to see new permissions (JWT needs refresh)`);
  } catch (error) {
    console.error(`Failed to update role for user ${userId}:`, error);
    throw error;
  }
}
