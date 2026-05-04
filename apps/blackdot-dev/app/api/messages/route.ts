import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { messages, channelMembers, channels, users } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/messages?channelId=xxx - Get messages for a channel
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
    const channelId = url.searchParams.get('channelId');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    if (!channelId) {
      return Response.json(
        { error: 'Missing required parameter: channelId' },
        { status: 400 }
      );
    }

    // Check if user has access to channel
    const channel = await db.query.channels.findFirst({
      where: eq(channels.id, channelId),
    });

    if (!channel) {
      return Response.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    if (channel.type !== 'public') {
      const isMember = await db.query.channelMembers.findFirst({
        where: and(
          eq(channelMembers.channelId, channelId),
          eq(channelMembers.userId, userId)
        ),
      });

      if (!isMember) {
        return Response.json(
          { error: 'No access to this channel' },
          { status: 403 }
        );
      }
    }

    // Get messages with user data
    const channelMessages = await db.query.messages.findMany({
      where: eq(messages.channelId, channelId),
      limit,
      orderBy: (m) => m.createdAt,
      with: {
        user: {
          columns: {
            id: true,
            clerkId: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            accessLevel: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return Response.json(channelMessages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return Response.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages - Create a new message
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
    const { channelId, content, type = 'text', replyToId } = body;

    if (!channelId || !content) {
      return Response.json(
        { error: 'Missing required fields: channelId, content' },
        { status: 400 }
      );
    }

    // Check if user has access to channel
    const channel = await db.query.channels.findFirst({
      where: eq(channels.id, channelId),
    });

    if (!channel) {
      return Response.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    if (channel.type !== 'public') {
      const isMember = await db.query.channelMembers.findFirst({
        where: and(
          eq(channelMembers.channelId, channelId),
          eq(channelMembers.userId, userId)
        ),
      });

      if (!isMember) {
        return Response.json(
          { error: 'No access to this channel' },
          { status: 403 }
        );
      }
    }

    // Create message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(messages).values({
      id: messageId,
      channelId,
      userId,
      content,
      type: type as any,
      replyToId: replyToId || null,
    });

    const newMessage = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
      with: {
        user: {
          columns: {
            id: true,
            clerkId: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            accessLevel: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return Response.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Failed to create message:', error);
    return Response.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
