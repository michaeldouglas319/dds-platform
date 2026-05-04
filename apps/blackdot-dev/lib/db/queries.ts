/**
 * Database Query Functions
 * Reusable queries for common operations
 */

import { db } from './index';
import { pages, sections, posts, conversations, workspaces } from '@/drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

/**
 * Get all sections for a page
 */
export const getPageSections = unstable_cache(
  async (pageSlug: string) => {
    const page = await db.query.pages.findFirst({
      where: eq(pages.slug, pageSlug),
    });

    if (!page) {
      return null;
    }

    const pageSections = await db.query.sections.findMany({
      where: eq(sections.pageId, page.id),
      orderBy: (s) => s.order,
    });

    return {
      page,
      sections: pageSections,
    };
  },
  ['page-sections'],
  { revalidate: 3600 } // Cache for 1 hour
);

/**
 * Get a single page by slug
 */
export const getPage = unstable_cache(
  async (slug: string) => {
    return await db.query.pages.findFirst({
      where: eq(pages.slug, slug),
    });
  },
  ['page'],
  { revalidate: 3600 }
);

/**
 * Get published posts
 */
export const getPublishedPosts = unstable_cache(
  async (limit = 20) => {
    return await db.query.posts.findMany({
      where: eq(posts.status, 'published'),
      limit,
      orderBy: (p) => p.publishedAt,
    });
  },
  ['published-posts'],
  { revalidate: 1800 } // Cache for 30 minutes
);

/**
 * Get a post by slug
 */
export const getPostBySlug = unstable_cache(
  async (slug: string) => {
    return await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
    });
  },
  ['post-by-slug'],
  { revalidate: 1800 }
);

/**
 * Get user's conversations
 */
export async function getUserConversations(userId: string) {
  return await db.query.conversations.findMany({
    where: eq(conversations.userId, userId),
    orderBy: (c) => c.updatedAt,
  });
}

/**
 * Get user's workspaces
 */
export async function getUserWorkspaces(userId: string) {
  return await db.query.workspaces.findMany({
    where: eq(workspaces.ownerId, userId),
  });
}
