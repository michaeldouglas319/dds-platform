import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { posts, postVersions } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

/**
 * PATCH /api/posts/[postId] - Update a post
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params
    const body = await req.json()
    const {
      title,
      slug,
      excerpt,
      content,
      status,
      tags,
      featuredImageUrl,
      changeDescription,
    } = body

    // Get existing post
    const existingPost = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    })

    if (!existingPost) {
      return Response.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check ownership
    if (existingPost.authorId !== userId) {
      return Response.json(
        { error: 'You can only update your own posts' },
        { status: 403 }
      )
    }

    // Check if new slug is unique (if changed)
    if (slug && slug !== existingPost.slug) {
      const existingSlug = await db.query.posts.findFirst({
        where: eq(posts.slug, slug),
      })

      if (existingSlug) {
        return Response.json(
          { error: 'Slug already exists' },
          { status: 409 }
        )
      }
    }

    // Update post
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (slug !== undefined) updateData.slug = slug
    if (excerpt !== undefined) updateData.excerpt = excerpt || null
    if (content !== undefined) updateData.content = content
    if (status !== undefined) updateData.status = status
    if (tags !== undefined) updateData.tags = tags
    if (featuredImageUrl !== undefined) updateData.featuredImageUrl = featuredImageUrl || null
    if (status === 'published' && !existingPost.publishedAt) {
      updateData.publishedAt = new Date()
    }
    updateData.updatedAt = new Date()

    await db.update(posts).set(updateData).where(eq(posts.id, postId))

    // Create new version if content changed
    if (content) {
      const lastVersion = await db.query.postVersions.findFirst({
        where: eq(postVersions.postId, postId),
        orderBy: (pv) => pv.version,
      })

      const nextVersion = (lastVersion?.version || 0) + 1
      const versionId = `pv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      await db.insert(postVersions).values({
        id: versionId,
        postId,
        version: nextVersion,
        title: title || existingPost.title,
        content,
        createdBy: userId,
        changesSummary: changeDescription || 'Updated',
      })
    }

    // Get updated post
    const updatedPost = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      with: {
        author: {
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

    return Response.json(updatedPost)
  } catch (error) {
    console.error('Failed to update post:', error)
    return Response.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/posts/[postId] - Delete a post
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params

    // Get existing post
    const existingPost = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    })

    if (!existingPost) {
      return Response.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check ownership
    if (existingPost.authorId !== userId) {
      return Response.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      )
    }

    // Delete post (cascades to versions and comments)
    await db.delete(posts).where(eq(posts.id, postId))

    return Response.json({ success: true })
  } catch (error) {
    console.error('Failed to delete post:', error)
    return Response.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
