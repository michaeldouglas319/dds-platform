import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { posts, postVersions, users } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/posts - Get posts (published by default, or user's drafts)
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const status = url.searchParams.get('status') || 'published';
    const myDrafts = url.searchParams.get('myDrafts') === 'true';

    let query;
    if (myDrafts && userId) {
      // Get user's own drafts and published posts
      console.log(`Fetching posts for user ${userId}`);
      query = db.select().from(posts)
        .where(eq(posts.authorId, userId))
        .orderBy(desc(posts.createdAt))
        .limit(limit);
    } else {
      // Get published posts
      query = db.select().from(posts)
        .where(eq(posts.status, status as any))
        .orderBy(desc(posts.publishedAt))
        .limit(limit);
    }

    const allPosts = await query;
    console.log(`Returned ${allPosts.length} posts`);
    return Response.json(allPosts);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to fetch posts:', errorMessage);
    console.error('Full error:', error);
    return Response.json(
      { error: 'Failed to fetch posts', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts - Create a new post
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

    // Ensure user exists in database (auto-sync from Clerk if needed)
    try {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!existingUser) {
        // Get user from Clerk and sync to database
        try {
          const client = await clerkClient();
          const clerkUser = await client.users.getUser(userId);

          await db.insert(users).values({
            id: userId,
            clerkId: userId,
            email: clerkUser.emailAddresses?.[0]?.emailAddress || 'unknown@example.com',
            firstName: clerkUser.firstName || null,
            lastName: clerkUser.lastName || null,
            avatarUrl: clerkUser.imageUrl || null,
            accessLevel: 'member' as any,
          });

          console.log(`Auto-synced user ${userId} to database`);
        } catch (insertError: any) {
          // User might already exist, that's ok
          if (!insertError.message?.includes('duplicate')) {
            throw insertError;
          }
          console.log(`User ${userId} already exists in database`);
        }
      }
    } catch (syncError) {
      console.error('Error syncing user:', syncError);
      // Continue anyway - the insert might still work
    }

    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      status = 'draft',
      featuredImageUrl,
    } = body;

    // Ensure tags is always an array
    const tags = Array.isArray(body.tags) ? body.tags : [];

    if (!title || !slug || !content) {
      return Response.json(
        { error: 'Missing required fields: title, slug, content' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPost = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
    });

    if (existingPost) {
      return Response.json(
        { error: 'Slug already exists' },
        { status: 409 }
      );
    }

    // Create post
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const publishedAt = status === 'published' ? new Date() : null;

    console.log('Inserting post with:', {
      postId,
      title,
      slug,
      authorId: userId,
      status,
      tagsLength: tags.length,
      contentType: typeof content,
    });

    await db.insert(posts).values({
      id: postId,
      title,
      slug,
      excerpt: excerpt || null,
      content,
      authorId: userId,
      status: status as any,
      tags: tags.length > 0 ? tags : null,
      featuredImageUrl: featuredImageUrl || null,
      publishedAt,
    });

    console.log('Post inserted successfully');

    // Create version 1
    const versionId = `pv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(postVersions).values({
      id: versionId,
      postId,
      version: 1,
      title,
      content,
      createdBy: userId,
      changesSummary: 'Initial version',
    });

    console.log('Post version created successfully');

    const newPost = await db.query.posts.findFirst({
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
    });

    return Response.json(newPost, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Failed to create post:', errorMessage);
    console.error('Full error:', error);
    return Response.json(
      { error: 'Failed to create post', details: errorMessage },
      { status: 500 }
    );
  }
}
