'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Presence, User } from '@/lib/types/chat.types'
import { formatUserName } from '@/lib/chat/utils'
import { cn } from '@/lib/utils'

interface PresenceIndicatorProps {
  presence: Array<Presence & { user?: User }>
  currentUserId: string
  onUserSelect?: (userId: string) => void
}

/**
 * Online users indicator showing presence state
 */
export function PresenceIndicator({
  presence,
  currentUserId,
  onUserSelect,
}: PresenceIndicatorProps) {
  const onlineUsers = presence.filter((p) => p.status === 'online' && p.userId !== currentUserId)

  return (
    <div className="flex flex-col h-full bg-background/60 backdrop-blur-3xl border-l border-white/10 shadow-[-20px_0_40px_rgba(0,0,0,0.3)]">
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-foreground">
          Online ({onlineUsers.length})
        </h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {onlineUsers.length === 0 ? (
            <div className="px-2 py-4 text-xs text-muted-foreground text-center">
              No one else online
            </div>
          ) : (
            onlineUsers.map((p) => (
              <button
                key={p.userId}
                onClick={() => onUserSelect?.(p.userId)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium transition-colors',
                  'hover:bg-background/80 active:bg-background',
                  'text-foreground'
                )}
              >
                <div className="relative">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={p.user?.avatarUrl} />
                    <AvatarFallback>
                      {(p.user?.firstName?.[0] || p.user?.email?.[0] || '?').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-background" />
                </div>
                <div className="flex-1 truncate text-left">
                  <div className="text-xs font-medium truncate">
                    {formatUserName(p.user?.firstName, p.user?.lastName)}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
