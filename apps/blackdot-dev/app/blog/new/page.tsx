import { BlogEditorContent } from '../components/BlogEditorContent'

/**
 * New blog post page - requires authentication
 * Auth level verified by middleware (proxy.ts)
 */
export default async function NewBlogPostPage() {
  return <BlogEditorContent />
}
