'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { UnreadBadge } from './UnreadBadge'
import { Channel } from '@/lib/types/chat.types'
import { formatChannelName } from '@/lib/chat/utils'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

interface ChannelListProps {
  channels: Channel[]
  currentChannelId: string | null
  onSelectChannel: (channelId: string) => void
  unreadCounts?: Record<string, number>
  isLoading?: boolean
  onCreateChannel?: () => void
}

/**
 * Channel list with unread indicators
 */
export function ChannelList({
  channels,
  currentChannelId,
  onSelectChannel,
  unreadCounts = {},
  isLoading,
  onCreateChannel,
}: ChannelListProps) {
  // Ensure channels is always an array
  const channelsList = Array.isArray(channels) ? channels : []

  return (
    <div className="flex flex-col h-full bg-background/60 backdrop-blur-3xl border-r border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.3)] w-[240px]">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Channels</h3>
        {onCreateChannel && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onCreateChannel}
            title="Create channel"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {isLoading ? (
            <div className="px-2 py-4 text-xs text-muted-foreground text-center">
              Loading channels...
            </div>
          ) : channelsList.length === 0 ? (
            <div className="px-2 py-4 text-xs text-muted-foreground text-center">
              No channels yet
            </div>
          ) : (
            channelsList.map((channel) => (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium transition-colors',
                  'hover:bg-background/80 active:bg-background',
                  currentChannelId === channel.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:text-foreground'
                )}
              >
                <span className="truncate flex-1 text-left">
                  {formatChannelName({ name: channel.name, type: channel.type }, '')}
                </span>
                {unreadCounts[channel.id] && (
                  <UnreadBadge count={unreadCounts[channel.id]} />
                )}
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
