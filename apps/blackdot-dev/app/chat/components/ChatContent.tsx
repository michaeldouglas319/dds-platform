'use client'

import { useEffect, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMobileDetection } from '@/hooks'
import { useSupabaseClient, useSupabasePresence } from '@/lib/supabase/client'
import {
  ChannelList,
  MessageInput,
  MessageList,
  PresenceIndicator,
  WorkspaceSelector,
} from '@/components/shared/chat'
import { GlobalChatTabs } from '@/components/shared/chat/GlobalChatTabs'
import { DirectMessagesList } from '@/components/shared/chat/DirectMessagesList'
import { UserDirectoryModal } from '@/components/shared/chat/UserDirectoryModal'
import { Channel, Message, Presence, Workspace } from '@/lib/types/chat.types'
import { isGlobalWorkspace } from '@/lib/chat/utils'
import { cn } from '@/lib/utils'

/**
 * Chat UI orchestration component
 * Manages workspace selection, channels, messages, and real-time updates
 */
export function ChatContent() {
  const { user, isLoaded } = useUser()
  const isMobile = useMobileDetection(1024)

  // State
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [presenceState, setPresenceState] = useState<Record<string, Presence>>({})
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)

  // Loading state
  const [workspacesLoading, setWorkspacesLoading] = useState(true)
  const [channelsLoading, setChannelsLoading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messageSending, setMessageSending] = useState(false)

  // UI state
  const [showChannelList, setShowChannelList] = useState(!isMobile)
  const [showUserDirectory, setShowUserDirectory] = useState(false)
  const [globalWorkspaceId, setGlobalWorkspaceId] = useState<string | null>(null)

  // Real-time presence subscription
  const presenceStateData = useSupabasePresence(
    currentWorkspaceId ? `workspace:${currentWorkspaceId}` : ''
  )

  // Update presence state from hook
  useEffect(() => {
    if (presenceStateData) {
      // Transform Supabase presence data to our type
      const transformed: Record<string, Presence> = {}
      for (const [key, value] of Object.entries(presenceStateData)) {
        if (Array.isArray(value) && value.length > 0) {
          transformed[key] = value[0] as Presence
        }
      }
      setPresenceState(transformed)
    }
  }, [presenceStateData])

  const [initError, setInitError] = useState<string | null>(null)
  const { client: supabaseClient } = useSupabaseClient()

  // Load workspaces directly from Supabase
  useEffect(() => {
    const loadWorkspaces = async () => {
      if (!isLoaded || !user) return

      try {
        // Query workspaces directly from Supabase
        const { data: workspacesList, error } = await supabaseClient
          .from('workspaces')
          .select('*')

        if (error) {
          setWorkspaces([])
          setWorkspacesLoading(false)
          return
        }

        const ws = workspacesList || []
        setWorkspaces(ws)

        // Find global workspace
        const globalWs = ws.find((w: any) => isGlobalWorkspace(w.id))
        if (globalWs) {
          setGlobalWorkspaceId(globalWs.id)
        }

        // Filter out global workspace from main selector
        const projectWorkspaces = ws.filter((w: Workspace) => !isGlobalWorkspace(w))
        if (projectWorkspaces.length > 0) {
          setCurrentWorkspaceId(projectWorkspaces[0].id)
        } else if (globalWs) {
          // If no project workspaces, default to global
          setCurrentWorkspaceId(globalWs.id)
        }
      } catch (error) {
        setInitError('Failed to initialize chat. Please refresh the page.')
      } finally {
        setWorkspacesLoading(false)
      }
    }

    loadWorkspaces()
  }, [isLoaded, user, supabaseClient])

  // Load channels when workspace changes - query Supabase directly
  useEffect(() => {
    const loadChannels = async () => {
      if (!currentWorkspaceId) return

      setChannelsLoading(true)
      try {
        const { data: channelsList, error } = await supabaseClient
          .from('channels')
          .select('*')
          .eq('workspace_id', currentWorkspaceId)

        if (error) {
          setChannels([])
          setChannelsLoading(false)
          return
        }

        const chs = channelsList || []
        setChannels(chs)

        if (chs.length > 0) {
          setCurrentChannelId(chs[0].id)
        } else {
          setCurrentChannelId(null)
          setMessages([])
        }
      } catch (error) {
        setChannels([])
      } finally {
        setChannelsLoading(false)
      }
    }

    loadChannels()
  }, [currentWorkspaceId, supabaseClient])

  // Load messages when channel changes and subscribe to real-time updates
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentChannelId) return

      setMessagesLoading(true)
      try {
        const { data: messagesList, error } = await supabaseClient
          .from('messages')
          .select('*')
          .eq('channel_id', currentChannelId)
          .order('created_at', { ascending: true })

        if (error) {
          setMessages([])
          setMessagesLoading(false)
          return
        }

        setMessages(messagesList || [])
      } catch (error) {
        setMessages([])
      } finally {
        setMessagesLoading(false)
      }
    }

    loadMessages()

    // Subscribe to real-time message updates
    const channel = supabaseClient
      .channel(`messages:${currentChannelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${currentChannelId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [currentChannelId, supabaseClient])

  // Handle send message - insert directly to Supabase
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!currentChannelId || !user) return

      setMessageSending(true)
      try {
        const { data, error } = await supabaseClient
          .from('messages')
          .insert({
            channel_id: currentChannelId,
            content,
            user_id: user.id,
            reply_to_id: replyingTo?.id,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error

        // Real-time subscription will add the message
        setReplyingTo(null)
      } catch (error) {
        // Silently fail - user will notice message doesn't appear
      } finally {
        setMessageSending(false)
      }
    },
    [currentChannelId, user, replyingTo, supabaseClient]
  )

  const handleSelectWorkspace = useCallback((workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId)
  }, [])

  const handleSelectChannel = useCallback((channelId: string) => {
    setCurrentChannelId(channelId)
    if (isMobile) {
      setShowChannelList(false)
    }
  }, [isMobile])

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      try {
        const response = await fetch(`/api/messages/${messageId}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete message')
        setMessages((prev) => prev.filter((m) => m.id !== messageId))
      } catch (error) {
        // Silently fail - deletion didn't work
      }
    },
    []
  )

  // Handle creating/opening a DM when user selects someone from directory
  const handleSelectUserFromDirectory = useCallback(
    async (recipientId: string) => {
      try {
        // Create or get existing DM channel
        const response = await fetch('/api/channels/direct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientId }),
        })

        if (!response.ok) throw new Error('Failed to create DM channel')

        const data = await response.json()
        if (data.success && globalWorkspaceId) {
          // Switch to global workspace
          setCurrentWorkspaceId(globalWorkspaceId)
          // Select the DM channel
          setCurrentChannelId(data.channel.id)
          // Close directory modal
          setShowUserDirectory(false)
        }
      } catch (error) {
        // Silently fail - DM creation didn't work
      }
    },
    [globalWorkspaceId]
  )

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  if (initError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="max-w-md text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-destructive/20 rounded-lg">
            <span className="text-lg">⚠️</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Chat Initialization Failed
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {initError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId)
  const currentChannel = channels.find((c) => c.id === currentChannelId)

  const projectWorkspaces = workspaces.filter((w) => !isGlobalWorkspace(w))
  const isGlobalWorkspaceSelected = currentWorkspaceId === globalWorkspaceId

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop: Left sidebar with workspace and channels */}
      {!isMobile && (
        <div className="flex flex-col border-r border-white/10 w-[280px]">
          <div className="p-4 border-b border-white/10">
            {/* Show WorkspaceSelector for project workspaces */}
            {!isGlobalWorkspaceSelected && (
              <WorkspaceSelector
                workspaces={projectWorkspaces}
                currentWorkspace={currentWorkspace}
                onSelectWorkspace={handleSelectWorkspace}
                isLoading={workspacesLoading}
              />
            )}
            {/* Show tabs for global workspace (DMs) */}
            {isGlobalWorkspaceSelected && (
              <div className="text-sm font-medium text-white/70">DDS Chat</div>
            )}
          </div>
          {/* Show channels or DMs based on selected workspace */}
          {!isGlobalWorkspaceSelected ? (
            <ChannelList
              channels={channels}
              currentChannelId={currentChannelId}
              onSelectChannel={handleSelectChannel}
              isLoading={channelsLoading}
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-2">
              <button
                onClick={() => setShowUserDirectory(true)}
                className="w-full mb-3 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                + New Message
              </button>
              <DirectMessagesList
                channels={channels.filter((c) => c.type === 'direct')}
                currentChannelId={currentChannelId}
                currentUserId={user?.id || ''}
                onSelectChannel={handleSelectChannel}
                isLoading={channelsLoading}
              />
            </div>
          )}
        </div>
      )}

      {/* Mobile: Channel list toggle */}
      {isMobile && showChannelList && (
        <div className="absolute inset-0 z-40 flex">
          <ChannelList
            channels={channels}
            currentChannelId={currentChannelId}
            onSelectChannel={handleSelectChannel}
            isLoading={channelsLoading}
          />
          <button
            className="flex-1 bg-black/50"
            onClick={() => setShowChannelList(false)}
          />
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-white/10 bg-background/60 backdrop-blur-md px-4 py-3 flex items-center justify-between">
          {isMobile && (
            <button
              onClick={() => setShowChannelList(!showChannelList)}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              ☰ Channels
            </button>
          )}
          {currentChannel && (
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                #{currentChannel.name}
              </h2>
              {currentChannel.description && (
                <p className="text-xs text-muted-foreground">
                  {currentChannel.description}
                </p>
              )}
            </div>
          )}
          {!currentChannel && (
            <div className="text-muted-foreground">
              {currentWorkspace ? 'Select a channel to start chatting' : 'No channels available'}
            </div>
          )}
        </div>

        {/* Messages and presence area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            <MessageList
              messages={messages}
              currentUserId={user?.id || ''}
              isLoading={messagesLoading}
              onReply={setReplyingTo}
              onDeleteMessage={handleDeleteMessage}
              presenceState={presenceState}
            />

            <MessageInput
              onSend={handleSendMessage}
              isLoading={messageSending}
              placeholder="Type a message..."
              replyingTo={replyingTo ?? undefined}
              onCancelReply={() => setReplyingTo(null)}
            />
          </div>

          {/* Right sidebar: Online users (desktop only) */}
          {!isMobile && (
            <PresenceIndicator
              presence={Object.values(presenceState)}
              currentUserId={user?.id || ''}
            />
          )}
        </div>
      </div>

      {/* User Directory Modal for starting DMs */}
      <UserDirectoryModal
        isOpen={showUserDirectory}
        onClose={() => setShowUserDirectory(false)}
        onSelectUser={handleSelectUserFromDirectory}
        currentUserId={user?.id || ''}
      />
    </div>
  )
}
