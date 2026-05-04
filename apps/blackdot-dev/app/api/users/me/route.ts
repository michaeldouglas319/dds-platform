import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users as usersTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"
import { AccessLevel } from "@/lib/types/auth.types"
import { createUserFromClerk } from "@/lib/db/utils/user-sync"

/**
 * GET /api/users/me
 * Get current user's role and basic profile info
 * Public endpoint - returns EVERYONE role if not authenticated
 */
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({
        role: AccessLevel.EVERYONE,
        user: null,
      })
    }

    let dbUser = await db.query.users.findFirst({
      where: eq(usersTable.clerkId, userId),
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        accessLevel: true,
      },
    })

    // If not found but Clerk userId exists, create user from Clerk data
    if (!dbUser) {
      console.warn(`User ${userId} authenticated by Clerk but missing from database - auto-creating`)

      try {
        const result = await createUserFromClerk(userId)
        dbUser = result.user
      } catch (createError) {
        console.error(`Failed to auto-create user ${userId}:`, createError)
        // Return EVERYONE role if creation fails
        return NextResponse.json({
          role: AccessLevel.EVERYONE,
          user: null,
        })
      }
    }

    return NextResponse.json({
      role: dbUser?.accessLevel || AccessLevel.EVERYONE,
      user: dbUser || null,
    })
  } catch (error) {
    console.error("Error fetching current user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    )
  }
}
