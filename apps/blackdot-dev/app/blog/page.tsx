import { BlogListContent } from './components/BlogListContent'

/**
 * Blog list page - requires authentication
 * Auth level verified by middleware (proxy.ts)
 */
export default async function BlogPage() {
  return <BlogListContent />
}
