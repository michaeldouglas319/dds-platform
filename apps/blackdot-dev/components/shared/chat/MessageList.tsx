'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageItem } from './MessageItem'
import { Message, Presence, User } from '@/lib/types/chat.types'
import { shouldGroupMessages } from '@/lib/chat/utils'
import { useEffect, useRef } from 'react'

interface MessageListProps {
  messages: Array<Message & { user?: User }>
  currentUserId: string
  userRole?: string
  presenceState?: Record<string, Presence>
  isLoading?: boolean
  onReply?: (message: Message) => void
  onDeleteMessage?: (messageId: string) => void
  autoScroll?: boolean
}

/**
 * Scrollable message feed with real-time support
 */
export function MessageList({
  messages,
  currentUserId,
  userRole,
  presenceState,
  isLoading,
  onReply,
  onDeleteMessage,
  autoScroll = true,
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Ensure messages is always an array
  const messagesList = Array.isArray(messages) ? messages : []

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messagesList, autoScroll])

  if (isLoading) {
    return (
      <ScrollArea className="flex-1">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Loading messages...
        </div>
      </ScrollArea>
    )
  }

  if (messagesList.length === 0) {
    return (
      <ScrollArea className="flex-1">
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          No messages yet. Start the conversation!
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea
      className="flex-1 bg-background/30"
      ref={scrollAreaRef}
    >
      <div className="space-y-0">
        {messagesList.map((message, index) => {
          const prevMessage = index > 0 ? messagesList[index - 1] : undefined
          const isCurrentUser = message.userId === currentUserId
          const grouped =
            prevMessage && shouldGroupMessages(
              {
                userId: prevMessage.userId,
                createdAt: prevMessage.createdAt instanceof Date ? prevMessage.createdAt.toISOString() : prevMessage.createdAt
              },
              {
                userId: message.userId,
                createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt
              }
            )

          return (
            <MessageItem
              key={message.id}
              message={message}
              isCurrentUser={isCurrentUser}
              currentUserId={currentUserId}
              userRole={userRole}
              onReply={onReply}
              onDelete={onDeleteMessage}
              grouped={grouped}
            />
          )
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}
