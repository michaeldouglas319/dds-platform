import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserRole } from '@/lib/auth'
import { ensureGlobalWorkspaceAccess } from '@/lib/services/workspace-autojoin.service'

/**
 * POST /api/chat/ensure-global-access
 * Failsafe endpoint to ensure current user is in global workspace
 * Called on chat page load
 * Requires any authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user ID
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user's current access level
    const accessLevel = await getUserRole()

    // Ensure user has access to global workspace
    const result = await ensureGlobalWorkspaceAccess(userId, accessLevel)

    return NextResponse.json({
      success: result.success,
      action: (result as any).action,
      error: (result as any).error,
    })
  } catch (error) {
    console.error('Error ensuring global workspace access:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to ensure global workspace access' },
      { status: 500 }
    )
  }
}
