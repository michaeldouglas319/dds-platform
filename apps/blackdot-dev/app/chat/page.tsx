import { ChatContent } from './components/ChatContent'

/**
 * Chat page - requires Member+ access
 * Auth level verified by middleware (proxy.ts)
 */
export default async function ChatPage() {
  return <ChatContent />
}
