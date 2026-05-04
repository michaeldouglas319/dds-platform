/**
 * API Types Barrel Exports
 *
 * Re-exports all API type definitions for convenient importing.
 *
 * @example
 * import {
 *   CreatePostRequest,
 *   PostResponse,
 *   CreateWorkspaceRequest,
 *   WorkspaceResponse,
 * } from '@/app/api/types';
 */

// Post types
export {
  type CreatePostRequest,
  type UpdatePostRequest,
  type ListPostsQuery,
  type CreatePostParams,
  type UpdatePostParams,
  type ListPostsParams,
  type PostResponse,
  type AuthorResponse,
  type PostVersionResponse,
  type PostListResponse,
  type PostDetailResponse,
  type PostStatus,
} from './post.types';

// Workspace types
export {
  type CreateWorkspaceRequest,
  type UpdateWorkspaceRequest,
  type ListWorkspacesQuery,
  type CreateWorkspaceParams,
  type UpdateWorkspaceParams,
  type ListWorkspacesParams,
  type WorkspaceResponse,
  type UserResponse,
  type WorkspaceMemberResponse,
  type WorkspaceListResponse,
  type WorkspaceDetailResponse,
  type WorkspaceMemberRole,
} from './workspace.types';

// Channel types
export {
  type CreateChannelRequest,
  type UpdateChannelRequest,
  type ListChannelsQuery,
  type CreateChannelParams,
  type UpdateChannelParams,
  type ListChannelsParams,
  type ChannelResponse,
  type ChannelMemberResponse,
  type ChannelListResponse,
  type ChannelDetailResponse,
  type ChannelType,
} from './channel.types';

// Message types
export {
  type SendMessageRequest,
  type UpdateMessageRequest,
  type ListMessagesQuery,
  type SendMessageParams,
  type UpdateMessageParams,
  type ListMessagesParams,
  type MessageResponse,
  type MessageReactionResponse,
  type MessageListResponse,
  type MessageDetailResponse,
  type MessageType,
} from './message.types';
