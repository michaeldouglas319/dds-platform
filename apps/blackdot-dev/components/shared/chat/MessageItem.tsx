'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Message, User } from '@/lib/types/chat.types'
import { formatMessageTime, formatUserName, canModifyMessage } from '@/lib/chat/utils'
import { cn } from '@/lib/utils'
import { MessageCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface MessageItemProps {
  message: Message & { user?: User }
  isCurrentUser: boolean
  currentUserId: string
  userRole?: string
  onReply?: (message: Message) => void
  onDelete?: (messageId: string) => void
  grouped?: boolean
}

/**
 * Single message display with user avatar, content, and actions
 */
export function MessageItem({
  message,
  isCurrentUser,
  currentUserId,
  userRole,
  onReply,
  onDelete,
  grouped = false,
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false)
  const canDelete = canModifyMessage(message.userId, currentUserId) || userRole === 'admin'

  return (
    <div className="group/message py-2 px-4 hover:bg-background/40 transition-colors">
      <div className="flex gap-3">
        {!grouped && (
          <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
            <AvatarImage src={message.user?.avatarUrl} />
            <AvatarFallback>
              {(message.user?.firstName?.[0] || message.user?.email?.[0] || '?').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        {grouped && <div className="w-8 flex-shrink-0" />}

        <div className="flex-1 min-w-0">
          {!grouped && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold text-foreground">
                {formatUserName(message.user?.firstName, message.user?.lastName)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatMessageTime(message.createdAt instanceof Date ? message.createdAt.toISOString() : message.createdAt)}
              </span>
            </div>
          )}

          <div
            className={cn(
              'text-sm text-foreground break-words whitespace-pre-wrap',
              message.type === 'system' && 'text-xs text-muted-foreground italic'
            )}
          >
            {message.content}
          </div>

          {message.replyTo && (
            <div className="mt-2 pl-2 border-l-2 border-muted-foreground/30 text-xs text-muted-foreground">
              <span className="font-medium">
                {formatUserName(message.replyTo?.user?.firstName, message.replyTo?.user?.lastName)}:
              </span>{' '}
              {message.replyTo.content.substring(0, 100)}
              {message.replyTo.content.length > 100 ? '...' : ''}
            </div>
          )}

          {/* Message actions */}
          <div
            className={cn(
              'flex items-center gap-1 mt-1 transition-opacity',
              showActions ? 'opacity-100' : 'opacity-0 group-hover/message:opacity-100'
            )}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
          >
            {onReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-xs"
                onClick={() => onReply(message)}
                title="Reply to message"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </Button>
            )}

            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-xs text-destructive hover:text-destructive"
                onClick={() => onDelete(message.id)}
                title="Delete message"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
