import { cache } from "react"
import { headers } from "next/headers"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { users as usersTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { AccessLevel, AccessLevelWeight, type AccessLevelType } from "@/lib/types/auth.types"
import { createUserFromClerk } from "@/lib/db/utils/user-sync"

/**
 * Authentication and Authorization for Server Components
 *
 * Uses React.cache() for request-level deduplication.
 * Multiple calls in same request return cached result.
 *
 * Middleware (proxy.ts) injects auth data into request headers:
 * - x-user-role: User's access level
 * - x-user-clerk-id: Clerk user ID
 * - x-user-id: Database user ID
 *
 * Use these functions in:
 * - Page components (app/**\/page.tsx)
 * - Layout components (app/**\/layout.tsx)
 * - Server Components
 *
 * For API routes, use /lib/db/utils/auth.ts instead.
 */

export const getUser = cache(async () => {
  // Clerk v6: auth() is now async and must be awaited
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    return user
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
})

export const getUserRole = cache(async (): Promise<AccessLevelType> => {
  // Try headers first (injected by middleware)
  const headerStore = await headers()
  const cachedRole = headerStore.get("x-user-role")
  const cachedClerkId = headerStore.get("x-user-clerk-id")

  if (cachedRole && cachedClerkId) {
    return cachedRole as AccessLevelType
  }

  // Fallback: Query DB (for API routes not going through middleware)
  const { userId } = await auth()

  if (!userId) {
    return AccessLevel.EVERYONE
  }

  try {
    // Read access level from DATABASE (Supabase PostgreSQL)
    // Clerk only validates authentication, not authorization
    let dbUser = await db.query.users.findFirst({
      where: eq(usersTable.clerkId, userId),
      columns: {
        accessLevel: true,
      },
    })

    // If not found but Clerk userId exists, create user from Clerk data
    if (!dbUser) {
      console.warn(`User ${userId} authenticated by Clerk but missing from database - auto-creating`)

      try {
        const result = await createUserFromClerk(userId)
        return (result.accessLevel as AccessLevelType) || AccessLevel.MEMBER
      } catch (createError) {
        console.error(`Failed to auto-create user ${userId}:`, createError)
        // Safe fallback: treat as basic member
        return AccessLevel.MEMBER
      }
    }

    return (dbUser.accessLevel as AccessLevelType) || AccessLevel.MEMBER
  } catch (error) {
    console.error("Error fetching user role from database:", error)
    return AccessLevel.EVERYONE
  }
})

/**
 * Check if user has at least the specified access level
 */
export async function hasAccessLevel(requiredLevel: AccessLevelType): Promise<boolean> {
  const userRole = await getUserRole()
  return AccessLevelWeight[userRole] >= AccessLevelWeight[requiredLevel]
}

/**
 * Check if user has exactly the specified access level
 */
export async function hasExactRole(role: AccessLevelType): Promise<boolean> {
  const userRole = await getUserRole()
  return userRole === role
}

/**
 * Generic access level guard
 */
export async function requireAccessLevel(
  requiredLevel: AccessLevelType,
  redirectUrl: string = "/unauthorized"
) {
  const { userId } = await auth()

  // EVERYONE level - no auth required
  if (requiredLevel === AccessLevel.EVERYONE) {
    return await getUser()
  }

  // All other levels require authentication
  if (!userId) {
    redirect("/login")
  }

  const user = await getUser()
  if (!user) {
    redirect("/login")
  }

  const hasAccess = await hasAccessLevel(requiredLevel)
  if (!hasAccess) {
    redirect(redirectUrl)
  }

  return user
}

// Legacy auth function - redirects non-authenticated users
export async function requireAuth() {
  // Clerk v6: auth() is now async and must be awaited
  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  return await getUser()
}

// Specific role guards for convenience
export async function requireMember() {
  return await requireAccessLevel(AccessLevel.MEMBER)
}

export async function requireMemberPlus() {
  return await requireAccessLevel(AccessLevel.MEMBER_PLUS)
}

export async function requirePartner() {
  return await requireAccessLevel(AccessLevel.PARTNER)
}

export async function requireAdmin() {
  return await requireAccessLevel(AccessLevel.ADMIN)
}
