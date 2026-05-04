import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { ADMIN_ROUTES, MEMBER_PLUS_ROUTES, MEMBER_ROUTES, PUBLIC_ROUTES } from '@/lib/auth/route-access'
import { AccessLevel, AccessLevelWeight } from '@/lib/types/auth.types'
import { db } from '@/lib/db'
import { users } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

// Create route matchers for each access level
const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES)
const isMemberRoute = createRouteMatcher(MEMBER_ROUTES)
const isMemberPlusRoute = createRouteMatcher(MEMBER_PLUS_ROUTES)
const isAdminRoute = createRouteMatcher(ADMIN_ROUTES)

// IMPORTANT: Next.js 16 requires 'export const proxy' instead of 'export default'
export const proxy = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Public routes - allow everyone
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // All protected routes require authentication
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Get user role from DATABASE (Supabase PostgreSQL)
  // Clerk only validates authentication, not authorization
  let userRole = AccessLevel.MEMBER
  let dbUserId: string | undefined

  try {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
      columns: {
        id: true,
        accessLevel: true,
      },
    })

    if (dbUser?.accessLevel) {
      userRole = dbUser.accessLevel as any
      dbUserId = dbUser.id
    }
  } catch (error) {
    console.error('Error fetching user role from database in middleware:', error)
    // Continue with default MEMBER role on error
  }

  const userWeight = AccessLevelWeight[userRole as keyof typeof AccessLevelWeight] || 1

  // Create response and inject auth headers for downstream consumption
  // This enables React.cache() deduplication in /lib/auth.ts
  const response = NextResponse.next()
  response.headers.set('x-user-role', userRole)
  response.headers.set('x-user-clerk-id', userId)
  if (dbUserId) {
    response.headers.set('x-user-id', dbUserId)
  }

  // Check ADMIN routes
  if (isAdminRoute(req)) {
    if (userWeight < AccessLevelWeight[AccessLevel.ADMIN]) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    return response
  }

  // Check MEMBER_PLUS routes
  if (isMemberPlusRoute(req)) {
    if (userWeight < AccessLevelWeight[AccessLevel.MEMBER_PLUS]) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    return response
  }

  // Check MEMBER routes
  if (isMemberRoute(req)) {
    if (userWeight < AccessLevelWeight[AccessLevel.MEMBER]) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
    return response
  }

  // Default: Allow authenticated users (handles unconfigured routes)
  return response
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - registry/* (component and route registry JSON files)
     * - assets/* (public assets directory)
     * - static files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|registry|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)',
    // Always run for API routes
    '/api/:path*',
  ],
}
