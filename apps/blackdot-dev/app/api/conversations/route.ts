import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { conversations, conversationMessages } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/conversations - Get all conversations for current user
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userConversations = await db.query.conversations.findMany({
      where: eq(conversations.userId, userId),
      orderBy: (c) => c.updatedAt,
    });

    return Response.json({ conversations: userConversations });
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return Response.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations - Create a new conversation
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
    const { title, model = 'gpt-4', systemPrompt } = body;

    // Create conversation
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(conversations).values({
      id: conversationId,
      userId,
      title: title || 'New Conversation',
      model,
      systemPrompt: systemPrompt || null,
    });

    const newConversation = await db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });

    return Response.json({ conversation: newConversation }, { status: 201 });
  } catch (error) {
    console.error('Failed to create conversation:', error);
    return Response.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
