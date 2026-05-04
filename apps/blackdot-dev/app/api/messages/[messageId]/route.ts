import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { messages } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

/**
 * DELETE /api/messages/[messageId] - Delete a message
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId } = await params

    // Get the message
    const message = await db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    })

    if (!message) {
      return Response.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if user is the message owner
    if (message.userId !== userId) {
      return Response.json(
        { error: 'You can only delete your own messages' },
        { status: 403 }
      )
    }

    // Delete message
    await db.delete(messages).where(eq(messages.id, messageId))

    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to delete message:', error)
    return Response.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
