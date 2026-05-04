import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { conversations, conversationMessages } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/conversations/[conversationId]/messages - Get all messages for a conversation
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { conversationId } = await params;

    // Check if user owns conversation
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });

    if (!conversation) {
      return Response.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (conversation.userId !== userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get messages
    const messages = await db.query.conversationMessages.findMany({
      where: eq(conversationMessages.conversationId, conversationId),
      orderBy: (m) => m.createdAt,
    });

    return Response.json({ messages });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return Response.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[conversationId]/messages - Create a new message
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { conversationId } = await params;
    const body = await req.json();
    const { role, content, tokens } = body;

    if (!role || !content) {
      return Response.json(
        { error: 'Missing required fields: role, content' },
        { status: 400 }
      );
    }

    // Check if user owns conversation
    const conversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });

    if (!conversation) {
      return Response.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    if (conversation.userId !== userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create message
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(conversationMessages).values({
      id: messageId,
      conversationId,
      role,
      content,
      tokens: tokens || null,
    });

    const newMessage = await db.query.conversationMessages.findFirst({
      where: (m) => eq(m.id, messageId),
    });

    return Response.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error('Failed to create message:', error);
    return Response.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}
