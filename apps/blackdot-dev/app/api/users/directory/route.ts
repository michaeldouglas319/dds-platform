import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, presence } from '@/drizzle/schema'
import { requireMemberPlus, getUser } from '@/lib/auth'
import { AccessLevel, AccessLevelWeight } from '@/lib/types/auth.types'
import { eq, and, gte, ilike, ne, sql } from 'drizzle-orm'

const PAGE_SIZE = 50

/**
 * GET /api/users/directory?search=&page=
 * Returns all Member+ users across all workspaces
 * Paginated, searchable by name/email
 * Requires Member+ access
 */
export async function GET(request: NextRequest) {
  try {
    // Ensure user has Member+ access
    const currentUser = await requireMemberPlus()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const pageStr = searchParams.get('page') || '0'
    const page = Math.max(0, parseInt(pageStr, 10))

    // Build search condition
    let searchCondition: ReturnType<typeof gte> | ReturnType<typeof and> = gte(
      users.accessLevel,
      AccessLevel.MEMBER_PLUS as any
    )

    if (search.trim()) {
      const searchPattern = `%${search}%`
      searchCondition = and(
        gte(users.accessLevel, AccessLevel.MEMBER_PLUS as any),
        // Search by first name, last name, or email
        sql`(${users.firstName} ILIKE ${searchPattern} OR ${users.lastName} ILIKE ${searchPattern} OR ${users.email} ILIKE ${searchPattern})`
      ) ?? searchCondition
    }

    // Exclude current user from results
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      )
    }

    const finalCondition = and(
      searchCondition,
      ne(users.id, currentUser.id)
    ) ?? sql`1=1`

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`CAST(COUNT(*) as INTEGER)` })
      .from(users)
      .where(finalCondition)

    const total = countResult[0]?.count || 0

    // Get paginated results with presence info
    const offset = page * PAGE_SIZE
    const directoryUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarUrl: users.avatarUrl,
        accessLevel: users.accessLevel,
        status: presence.status,
      })
      .from(users)
      .leftJoin(presence, eq(presence.userId, users.id))
      .where(finalCondition)
      .orderBy(sql`${users.firstName} ASC, ${users.lastName} ASC`)
      .limit(PAGE_SIZE)
      .offset(offset)

    return NextResponse.json({
      success: true,
      data: directoryUsers.map((user) => ({
        id: user.id,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        avatar: user.avatarUrl,
        accessLevel: user.accessLevel,
        isOnline: user.status === 'online',
      })),
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        hasMore: offset + PAGE_SIZE < total,
      },
    })
  } catch (error) {
    console.error('Error fetching user directory:', error)

    // If user is not authenticated, requireMemberPlus will redirect
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user directory' },
      { status: 500 }
    )
  }
}
