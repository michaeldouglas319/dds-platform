/**
 * Message API Type Definitions
 *
 * Defines all request, response, and parameter types for message operations.
 */

/**
 * Message type
 */
export type MessageType = 'text' | 'image' | 'file' | 'system';

/**
 * Request: Send a new message
 */
export interface SendMessageRequest {
  channelId: string;
  content: string;
  type?: MessageType;
  replyToId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Request: Update a message
 */
export interface UpdateMessageRequest {
  content?: string;
}

/**
 * Query parameters: List messages
 */
export interface ListMessagesQuery {
  channelId: string;
  page?: number;
  pageSize?: number;
}

/**
 * Service params: Send message
 */
export interface SendMessageParams {
  channelId: string;
  userId: string;
  content: string;
  type?: MessageType;
  replyToId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Service params: Update message
 */
export interface UpdateMessageParams {
  content?: string;
}

/**
 * Service params: List messages
 */
export interface ListMessagesParams {
  channelId: string;
  page?: number;
  pageSize?: number;
}

/**
 * Response: User information (short form)
 */
export interface UserResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

/**
 * Response: Message
 */
export interface MessageResponse {
  id: string;
  channelId: string;
  userId: string;
  user?: UserResponse;
  content: string;
  type: MessageType;
  replyToId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response: Message reaction
 */
export interface MessageReactionResponse {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

/**
 * Response: Paginated messages list
 */
export interface MessageListResponse {
  data: MessageResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Response: Message with reactions and reply
 */
export interface MessageDetailResponse {
  message: MessageResponse;
  replyTo?: MessageResponse;
  reactions: MessageReactionResponse[];
}
