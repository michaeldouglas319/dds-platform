/**
 * Chat system types
 * Defines TypeScript interfaces for chat-related entities
 */

export type MessageType = 'text' | 'image' | 'file' | 'system'
export type ChannelType = 'public' | 'private' | 'direct'

export interface User {
  id: string
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  accessLevel: string
  createdAt: Date
  updatedAt: Date
}

export interface Workspace {
  id: string
  name: string
  description?: string
  avatarUrl?: string
  ownerId: string
  requiredAccessLevel: string
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  owner?: User
  memberCount?: number
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: Date
  user?: User
}

export interface Channel {
  id: string
  workspaceId: string
  name: string
  description?: string
  type: ChannelType
  createdBy: string
  createdAt: Date
  updatedAt: Date
  creator?: User
  memberCount?: number
}

export interface ChannelMember {
  id: string
  channelId: string
  userId: string
  joinedAt: Date
  user?: User
}

export interface Message {
  id: string
  channelId: string
  userId: string
  content: string
  type: MessageType
  replyToId?: string
  metadata?: {
    attachments?: Array<{
      url: string
      type: string
      name: string
    }>
    mentions?: string[]
    [key: string]: any
  }
  createdAt: Date
  updatedAt: Date
  user?: User
  replyTo?: Message
}

export interface MessageReaction {
  id: string
  messageId: string
  userId: string
  emoji: string
  createdAt: Date
  user?: User
}

export interface Presence {
  id: string
  workspaceId: string
  userId: string
  channelId?: string
  status: 'online' | 'away' | 'offline'
  lastSeenAt: Date
  user?: User
}

export interface ChatContextData {
  workspaces: Workspace[]
  channels: Channel[]
  messages: Message[]
  presenceState: Record<string, Presence>
  currentWorkspaceId: string | null
  currentChannelId: string | null
  currentUserId: string
}

export interface CreateMessagePayload {
  content: string
  channelId: string
  userId: string
  type?: MessageType
  replyToId?: string
  metadata?: Message['metadata']
}

export interface UpdateMessagePayload {
  content: string
  type?: MessageType
}

export interface CreateChannelPayload {
  name: string
  workspaceId: string
  description?: string
  type: ChannelType
}

export interface CreateWorkspacePayload {
  name: string
  description?: string
  avatarUrl?: string
}

// Component prop types
export interface MessageItemProps {
  message: Message
  onReply?: (message: Message) => void
  onReact?: (emoji: string) => void
  isCurrentUser: boolean
}

export interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  onReply?: (message: Message) => void
  onMessageDelete?: (messageId: string) => void
  presenceState?: Record<string, Presence>
}

export interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  onTyping?: () => void
  isLoading?: boolean
  placeholder?: string
  replyingTo?: Message
  onCancelReply?: () => void
}

export interface ChannelListProps {
  channels: Channel[]
  currentChannelId: string | null
  onSelectChannel: (channelId: string) => void
  unreadCounts?: Record<string, number>
  isLoading?: boolean
}

export interface WorkspaceSelectorProps {
  workspaces: Workspace[]
  currentWorkspaceId: string | null
  onSelectWorkspace: (workspaceId: string) => void
  isLoading?: boolean
}

export interface PresenceIndicatorProps {
  presence: Presence[]
  currentUserId: string
  onUserSelect?: (userId: string) => void
}

// Global chat / Direct messaging types
export interface DirectoryUser {
  id: string
  email: string
  name: string
  avatar?: string
  accessLevel: string
  isOnline: boolean
}

export interface UserDirectoryResult {
  success: boolean
  data: DirectoryUser[]
  pagination: {
    page: number
    pageSize: number
    total: number
    hasMore: boolean
  }
}

export interface DirectMessageCreateRequest {
  recipientId: string
}

export interface DirectMessageCreateResponse {
  success: boolean
  channel: {
    id: string
    name: string
    type: 'direct'
    workspaceId: string
  }
}
