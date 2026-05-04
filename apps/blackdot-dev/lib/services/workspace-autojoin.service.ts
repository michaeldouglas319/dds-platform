import { db } from '@/lib/db'
import { workspaceMembers, workspaces, users } from '@/drizzle/schema'
import { AccessLevel, AccessLevelWeight, type AccessLevelType } from '@/lib/types/auth.types'
import { eq, and, sql } from 'drizzle-orm'

const GLOBAL_WORKSPACE_ID = 'ws_global_dds_chat'

/**
 * Get the global DDS Chat workspace
 * Creates it if it doesn't exist (failsafe)
 */
export async function getGlobalWorkspace() {
  // Try to find existing global workspace
  const existing = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, GLOBAL_WORKSPACE_ID))
    .limit(1)

  if (existing.length > 0) {
    return existing[0]
  }

  // Fallback: create global workspace if missing
  // Try to find an admin user to be owner, otherwise use first user or system
  let ownerId: string | null = null

  const adminUser = await db
    .select()
    .from(users)
    .where(eq(users.accessLevel, AccessLevel.ADMIN))
    .orderBy(users.createdAt)
    .limit(1)

  if (adminUser.length > 0) {
    ownerId = adminUser[0].id
  } else {
    // If no admin, use first user
    const firstUser = await db
      .select()
      .from(users)
      .orderBy(users.createdAt)
      .limit(1)

    if (firstUser.length > 0) {
      ownerId = firstUser[0].id
    } else {
      // If no users at all, use 'system' (will be assigned when first admin is created)
      ownerId = 'system'
    }
  }

  const newWorkspace = {
    id: GLOBAL_WORKSPACE_ID,
    name: 'DDS Chat',
    description: 'Global workspace for direct messaging across DDS V3',
    avatarUrl: null,
    ownerId: ownerId,
    requiredAccessLevel: AccessLevel.MEMBER_PLUS as AccessLevelType,
    metadata: { isGlobal: true, system: true },
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  await db.insert(workspaces).values(newWorkspace)
  return newWorkspace
}

/**
 * Check if user should have access to the global workspace
 * Returns true if user is Member+ or higher
 */
function shouldHaveGlobalAccess(accessLevel: AccessLevelType): boolean {
  const memberPlusWeight = AccessLevelWeight[AccessLevel.MEMBER_PLUS]
  const userWeight = AccessLevelWeight[accessLevel]
  return userWeight >= memberPlusWeight
}

/**
 * Auto-join a user to the global workspace
 * Safe to call multiple times (idempotent)
 *
 * @param userId The user ID to auto-join
 * @param accessLevel The user's current access level
 */
export async function autoJoinGlobalWorkspace(userId: string, accessLevel: AccessLevelType) {
  try {
    // Check if user has sufficient access level
    if (!shouldHaveGlobalAccess(accessLevel)) {
      // User doesn't have access - remove them if they're already a member
      await removeFromGlobalWorkspace(userId)
      return { success: true, action: 'removed', reason: 'Insufficient access level' }
    }

    // Get or create global workspace
    const globalWorkspace = await getGlobalWorkspace()

    // Check if user is already a member
    const existingMembership = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, globalWorkspace.id),
          eq(workspaceMembers.userId, userId)
        )
      )
      .limit(1)

    if (existingMembership.length > 0) {
      return { success: true, action: 'already-member' }
    }

    // Add user to global workspace
    const membershipId = `wm_${userId}_${globalWorkspace.id}`
    await db.insert(workspaceMembers).values({
      id: membershipId,
      workspaceId: globalWorkspace.id,
      userId,
      role: 'member',
      joinedAt: new Date(),
    })

    return { success: true, action: 'joined' }
  } catch (error) {
    console.error('Error in autoJoinGlobalWorkspace:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Remove a user from the global workspace
 * Called when user is downgraded below Member+
 */
export async function removeFromGlobalWorkspace(userId: string) {
  try {
    const globalWorkspace = await getGlobalWorkspace()

    await db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, globalWorkspace.id),
          eq(workspaceMembers.userId, userId)
        )
      )

    return { success: true }
  } catch (error) {
    console.error('Error in removeFromGlobalWorkspace:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Ensure a user is in the global workspace
 * Failsafe method called on chat page load
 */
export async function ensureGlobalWorkspaceAccess(userId: string, accessLevel: AccessLevelType) {
  return await autoJoinGlobalWorkspace(userId, accessLevel)
}

/**
 * Get the global workspace ID
 * Used by API endpoints
 */
export function getGlobalWorkspaceId(): string {
  return GLOBAL_WORKSPACE_ID
}

/**
 * Check if a workspace is the global workspace
 */
export function isGlobalWorkspace(workspaceId: string): boolean {
  return workspaceId === GLOBAL_WORKSPACE_ID
}
