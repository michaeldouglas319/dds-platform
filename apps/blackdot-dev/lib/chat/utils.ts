import type { Channel, Workspace } from '@/lib/types/chat.types'

/**
 * Check if a workspace is the global DDS Chat workspace
 */
export function isGlobalWorkspace(workspace: Workspace | null): boolean {
  if (!workspace) return false
  return workspace.metadata?.isGlobal === true
}

/**
 * Check if a channel is a direct message channel
 */
export function isDirectMessageChannel(channel: Channel): boolean {
  return channel.type === 'direct'
}

/**
 * Extract recipient user ID from a DM channel name
 * DM channel names are formatted as: dm_userId1_userId2
 * Returns the "other" user ID (not the current user)
 *
 * @param channelName The channel name
 * @param currentUserId The current user's ID
 * @returns The recipient's user ID, or null if not a valid DM channel
 */
export function getDirectMessageRecipient(
  channelName: string,
  currentUserId: string
): string | null {
  // Extract the pattern dm_userId1_userId2
  const dmPattern = /^dm_(.+)_(.+)$/
  const match = channelName.match(dmPattern)

  if (!match) {
    return null
  }

  const [, userId1, userId2] = match

  // Return the user ID that is not the current user
  if (userId1 === currentUserId) {
    return userId2
  } else if (userId2 === currentUserId) {
    return userId1
  }

  return null
}

/**
 * Generate a deterministic DM channel name from two user IDs
 * @param userId1 First user ID
 * @param userId2 Second user ID
 * @returns Formatted channel name: dm_userId1_userId2
 */
export function generateDMChannelName(userId1: string, userId2: string): string {
  const [u1, u2] = [userId1, userId2].sort()
  return `dm_${u1}_${u2}`
}

/**
 * Get display name for a DM channel
 * If it's a DM, extracts the recipient name, otherwise returns the channel name
 *
 * @param channel The channel object
 * @param currentUserId The current user's ID
 * @param recipientName Optional recipient display name
 * @returns Display name for the channel
 */
export function getChannelDisplayName(
  channel: Channel,
  currentUserId: string,
  recipientName?: string
): string {
  if (isDirectMessageChannel(channel) && recipientName) {
    return recipientName
  }

  return channel.name
}

/**
 * Check if a message can be modified by the current user
 * @param messageUserId The user ID of the message creator
 * @param currentUserId The current user's ID
 * @returns True if the current user can modify the message
 */
export function canModifyMessage(messageUserId: string, currentUserId: string): boolean {
  return messageUserId === currentUserId
}

/**
 * Format a message timestamp
 * @param timestamp The timestamp to format
 * @returns Formatted time string
 */
export function formatMessageTime(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

/**
 * Format a user name
 * @param firstName User's first name
 * @param lastName User's last name
 * @returns Formatted user name
 */
export function formatUserName(firstName?: string, lastName?: string): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  return firstName || lastName || 'Unknown User'
}

/**
 * Validate message content
 * @param content Message content to validate
 * @returns True if content is valid, false otherwise
 */
export function validateMessageContent(content: string): boolean {
  if (!content || typeof content !== 'string') {
    return false
  }
  return content.trim().length > 0 && content.length <= 5000
}

/**
 * Debounce typing indicator
 * @param callback Function to call after debounce
 * @param delay Debounce delay in milliseconds
 * @returns Debounced function
 */
export function debounceTyping(callback: () => void, delay: number = 300): () => void {
  let timeoutId: NodeJS.Timeout | null = null

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      callback()
      timeoutId = null
    }, delay)
  }
}

/**
 * Format a channel name for display
 * @param channel Channel object
 * @param currentUserId Current user's ID
 * @param recipientName Optional recipient name for DMs
 * @returns Formatted channel name
 */
export function formatChannelName(
  channel: { name: string; type: string },
  currentUserId: string,
  recipientName?: string
): string {
  if (channel.type === 'direct' && recipientName) {
    return recipientName
  }
  return channel.name
}

/**
 * Determine if messages should be grouped together
 * @param message1 First message
 * @param message2 Second message
 * @param timeGapMinutes Time gap in minutes to consider messages grouped
 * @returns True if messages should be grouped
 */
export function shouldGroupMessages(
  message1: { userId: string; createdAt: string },
  message2: { userId: string; createdAt: string },
  timeGapMinutes: number = 5
): boolean {
  // Messages from same user within time gap should be grouped
  if (message1.userId !== message2.userId) {
    return false
  }

  try {
    const time1 = new Date(message1.createdAt).getTime()
    const time2 = new Date(message2.createdAt).getTime()
    const timeDiff = Math.abs(time2 - time1) / (1000 * 60) // Convert to minutes

    return timeDiff <= timeGapMinutes
  } catch {
    return false
  }
}
