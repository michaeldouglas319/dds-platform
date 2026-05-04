import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { channels, channelMembers, workspaces, workspaceMembers } from '@/drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * GET /api/channels?workspaceId=xxx - Get channels for a workspace
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const workspaceId = url.searchParams.get('workspaceId');

    // If workspaceId provided, get channels for that workspace
    if (workspaceId) {
      // Check if user is member of workspace
      const isMember = await db.query.workspaceMembers.findFirst({
        where: and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        ),
      });

      if (!isMember) {
        return Response.json(
          { error: 'Not a member of this workspace' },
          { status: 403 }
        );
      }

      const allChannels = await db.query.channels.findMany({
        where: eq(channels.workspaceId, workspaceId),
        with: {
          creator: {
            columns: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Filter to only channels user is member of or public channels
      const accessibleChannels = await Promise.all(
        allChannels.map(async (channel) => {
          if (channel.type === 'public') {
            return channel;
          }

          const isMember = await db.query.channelMembers.findFirst({
            where: and(
              eq(channelMembers.channelId, channel.id),
              eq(channelMembers.userId, userId)
            ),
          });

          return isMember ? channel : null;
        })
      );

      return Response.json(accessibleChannels.filter(Boolean));
    }

    // Get all workspaces user is member of
    const userWorkspaces = await db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.userId, userId),
      columns: { workspaceId: true },
    });

    const workspaceIds = userWorkspaces.map(ws => ws.workspaceId);

    if (workspaceIds.length === 0) {
      return Response.json([]);
    }

    // Get all channels in those workspaces
    const allChannels = await db.query.channels.findMany({
      where: (ch) => inArray(ch.workspaceId, workspaceIds),
      with: {
        creator: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Filter to only channels user is member of or public channels
    const accessibleChannels = await Promise.all(
      allChannels.map(async (channel) => {
        if (channel.type === 'public') {
          return channel;
        }

        const isMember = await db.query.channelMembers.findFirst({
          where: and(
            eq(channelMembers.channelId, channel.id),
            eq(channelMembers.userId, userId)
          ),
        });

        return isMember ? channel : null;
      })
    );

    return Response.json(accessibleChannels.filter(Boolean));
  } catch (error) {
    console.error('Failed to fetch channels:', error);
    return Response.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/channels - Create a new channel
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { workspaceId, name, description, type = 'public' } = body;

    if (!workspaceId || !name) {
      return Response.json(
        { error: 'Missing required fields: workspaceId, name' },
        { status: 400 }
      );
    }

    // Check if user is member of workspace
    const membership = await db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      ),
    });

    if (!membership) {
      return Response.json(
        { error: 'Not a member of this workspace' },
        { status: 403 }
      );
    }

    // Create channel
    const channelId = `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(channels).values({
      id: channelId,
      workspaceId,
      name,
      description: description || null,
      type: type as any,
      createdBy: userId,
    });

    // Add creator as member
    if (type !== 'public') {
      const memberId = `chm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(channelMembers).values({
        id: memberId,
        channelId,
        userId,
      });
    }

    const newChannel = await db.query.channels.findFirst({
      where: eq(channels.id, channelId),
      with: {
        creator: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return Response.json(newChannel, { status: 201 });
  } catch (error) {
    console.error('Failed to create channel:', error);
    return Response.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    );
  }
}
