import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { channels, channelMembers, workspaceMembers } from '@/drizzle/schema'
import { requireMemberPlus, getUser } from '@/lib/auth'
import { getGlobalWorkspace } from '@/lib/services/workspace-autojoin.service'
import { eq, and } from 'drizzle-orm'

/**
 * POST /api/channels/direct
 * Creates or gets an existing DM channel in the global workspace
 * Both users are automatically added as channel members
 * Requires Member+ access
 *
 * Request body:
 * {
 *   recipientId: string  // User ID of the other person
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Ensure user has Member+ access
    const currentUser = await requireMemberPlus()

    // Parse request body
    const body = await request.json()
    const { recipientId } = body

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!recipientId) {
      return NextResponse.json(
        { success: false, error: 'recipientId is required' },
        { status: 400 }
      )
    }

    if (recipientId === currentUser.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot create DM with yourself' },
        { status: 400 }
      )
    }

    // Get or create global workspace
    const globalWorkspace = await getGlobalWorkspace()

    // Generate deterministic channel name
    // Sort user IDs to ensure consistent channel names
    const [user1, user2] = [currentUser.id, recipientId].sort()
    const channelName = `dm_${user1}_${user2}`
    const channelId = `ch_${channelName}`

    // Check if channel already exists
    const existingChannel = await db
      .select()
      .from(channels)
      .where(
        and(
          eq(channels.workspaceId, globalWorkspace.id),
          eq(channels.name, channelName)
        )
      )
      .limit(1)

    if (existingChannel.length > 0) {
      // Channel exists, return it
      return NextResponse.json({
        success: true,
        channel: {
          id: existingChannel[0].id,
          name: existingChannel[0].name,
          type: existingChannel[0].type,
          workspaceId: existingChannel[0].workspaceId,
        },
      })
    }

    // Create new DM channel
    const newChannel = {
      id: channelId,
      workspaceId: globalWorkspace.id,
      name: channelName,
      description: null,
      type: 'direct' as const,
      createdBy: currentUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    try {
      await db.insert(channels).values(newChannel)
    } catch (error) {
      // Handle race condition where another request created the channel
      const raceConditionChannel = await db
        .select()
        .from(channels)
        .where(
          and(
            eq(channels.workspaceId, globalWorkspace.id),
            eq(channels.name, channelName)
          )
        )
        .limit(1)

      if (raceConditionChannel.length > 0) {
        return NextResponse.json({
          success: true,
          channel: {
            id: raceConditionChannel[0].id,
            name: raceConditionChannel[0].name,
            type: raceConditionChannel[0].type,
            workspaceId: raceConditionChannel[0].workspaceId,
          },
        })
      }

      throw error
    }

    // Add current user as channel member
    const member1Id = `cm_${channelId}_${currentUser.id}`
    await db.insert(channelMembers).values({
      id: member1Id,
      channelId,
      userId: currentUser.id,
      joinedAt: new Date(),
    })

    // Add recipient as channel member
    const member2Id = `cm_${channelId}_${recipientId}`
    try {
      await db.insert(channelMembers).values({
        id: member2Id,
        channelId,
        userId: recipientId,
        joinedAt: new Date(),
      })
    } catch (error) {
      // Handle race condition where recipient is already added
      console.log('Recipient already added as channel member')
    }

    return NextResponse.json({
      success: true,
      channel: {
        id: channelId,
        name: channelName,
        type: 'direct',
        workspaceId: globalWorkspace.id,
      },
    })
  } catch (error) {
    console.error('Error creating/fetching DM channel:', error)

    // If user is not authenticated, requireMemberPlus will redirect
    return NextResponse.json(
      { success: false, error: 'Failed to create/fetch DM channel' },
      { status: 500 }
    )
  }
}
