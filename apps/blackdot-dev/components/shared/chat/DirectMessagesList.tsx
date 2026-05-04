'use client'

import { useMemo } from 'react'
import { MessageCircle } from 'lucide-react'
import type { Channel } from '@/lib/types/chat.types'
import { isDirectMessageChannel, getDirectMessageRecipient } from '@/lib/chat/utils'

interface DirectMessagesListProps {
  channels: Channel[]
  currentChannelId: string | null
  currentUserId: string
  onSelectChannel: (channelId: string) => void
  userNames?: Record<string, string>
  isLoading?: boolean
}

export function DirectMessagesList({
  channels,
  currentChannelId,
  currentUserId,
  onSelectChannel,
  userNames = {},
  isLoading = false,
}: DirectMessagesListProps) {
  const dmChannels = useMemo(() => {
    return channels.filter((ch) => isDirectMessageChannel(ch))
  }, [channels])

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (dmChannels.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <div className="text-center">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No direct messages yet</p>
          <p className="text-xs opacity-75">Start a conversation above</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {dmChannels.map((channel) => {
        const recipientId = getDirectMessageRecipient(channel.name, currentUserId)
        const recipientName = recipientId ? (userNames[recipientId] || 'User') : 'Unknown'
        const isSelected = currentChannelId === channel.id

        return (
          <button
            key={channel.id}
            onClick={() => onSelectChannel(channel.id)}
            className={isSelected ? 'w-full text-left px-3 py-2 rounded-lg transition-colors bg-blue-600 text-white' : 'w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-700'}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 flex-shrink-0" />
              <span className="truncate font-medium">{recipientName}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
