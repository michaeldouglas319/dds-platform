/**
 * Channel API Type Definitions
 *
 * Defines all request, response, and parameter types for channel operations.
 */

/**
 * Channel type/visibility
 */
export type ChannelType = 'public' | 'private' | 'direct';

/**
 * Request: Create a new channel
 */
export interface CreateChannelRequest {
  workspaceId: string;
  name: string;
  description?: string;
  type?: ChannelType;
}

/**
 * Request: Update a channel
 */
export interface UpdateChannelRequest extends Partial<Omit<CreateChannelRequest, 'workspaceId'>> {}

/**
 * Query parameters: List channels
 */
export interface ListChannelsQuery {
  workspaceId?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Service params: Create channel
 */
export interface CreateChannelParams {
  workspaceId: string;
  name: string;
  description?: string;
  type?: ChannelType;
}

/**
 * Service params: Update channel
 */
export interface UpdateChannelParams extends Partial<Omit<CreateChannelParams, 'workspaceId'>> {}

/**
 * Service params: List channels
 */
export interface ListChannelsParams {
  workspaceId?: string;
  userId: string;
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
 * Response: Channel
 */
export interface ChannelResponse {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: ChannelType;
  createdBy: string;
  creator?: UserResponse;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response: Channel member
 */
export interface ChannelMemberResponse {
  id: string;
  channelId: string;
  userId: string;
  joinedAt: Date;
}

/**
 * Response: Paginated channels list
 */
export interface ChannelListResponse {
  data: ChannelResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Response: Channel with members
 */
export interface ChannelDetailResponse {
  channel: ChannelResponse;
  members: ChannelMemberResponse[];
}
