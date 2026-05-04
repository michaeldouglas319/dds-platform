import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { posts, postVersions } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

/**
 * GET /api/posts/[postId]/versions - Get version history for a post
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params

    // Get post to verify ownership
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    })

    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check ownership
    if (post.authorId !== userId) {
      return Response.json(
        { error: 'You can only view your own post versions' },
        { status: 403 }
      )
    }

    // Get all versions
    const versions = await db.query.postVersions.findMany({
      where: eq(postVersions.postId, postId),
      orderBy: (pv) => pv.version,
      with: {
        createdByUser: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    })

    return Response.json(versions)
  } catch (error) {
    console.error('Failed to fetch versions:', error)
    return Response.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    )
  }
}
