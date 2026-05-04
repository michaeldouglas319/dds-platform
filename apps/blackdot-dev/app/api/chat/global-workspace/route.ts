import { NextRequest, NextResponse } from 'next/server'
import { requireMemberPlus } from '@/lib/auth'
import { getGlobalWorkspace } from '@/lib/services/workspace-autojoin.service'

/**
 * GET /api/chat/global-workspace
 * Returns the global DDS Chat workspace
 * Requires Member+ access
 */
export async function GET(request: NextRequest) {
  try {
    // Ensure user has Member+ access
    await requireMemberPlus()

    // Get or create global workspace
    const globalWorkspace = await getGlobalWorkspace()

    return NextResponse.json({
      success: true,
      workspace: {
        id: globalWorkspace.id,
        name: globalWorkspace.name,
        description: globalWorkspace.description,
      },
    })
  } catch (error) {
    console.error('Error fetching global workspace:', error)

    // If user is not authenticated, requireMemberPlus will redirect
    return NextResponse.json(
      { success: false, error: 'Failed to fetch global workspace' },
      { status: 500 }
    )
  }
}
