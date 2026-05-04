/**
 * Workspace API Type Definitions
 *
 * Defines all request, response, and parameter types for workspace operations.
 */

/**
 * Workspace member role
 */
export type WorkspaceMemberRole = 'owner' | 'admin' | 'member';

/**
 * Request: Create a new workspace
 */
export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  avatarUrl?: string;
}

/**
 * Request: Update a workspace
 */
export interface UpdateWorkspaceRequest extends Partial<CreateWorkspaceRequest> {}

/**
 * Query parameters: List workspaces
 */
export interface ListWorkspacesQuery {
  page?: number;
  pageSize?: number;
}

/**
 * Service params: Create workspace
 */
export interface CreateWorkspaceParams {
  name: string;
  description?: string;
  avatarUrl?: string;
}

/**
 * Service params: Update workspace
 */
export interface UpdateWorkspaceParams extends Partial<CreateWorkspaceParams> {}

/**
 * Service params: List workspaces
 */
export interface ListWorkspacesParams {
  userId: string;
  page?: number;
  pageSize?: number;
}

/**
 * Response: Workspace
 */
export interface WorkspaceResponse {
  id: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  ownerId: string;
  owner?: UserResponse;
  createdAt: Date;
  updatedAt: Date;
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
 * Response: Workspace member
 */
export interface WorkspaceMemberResponse {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceMemberRole;
  joinedAt: Date;
}

/**
 * Response: Paginated workspaces list
 */
export interface WorkspaceListResponse {
  data: WorkspaceResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Response: Workspace with members
 */
export interface WorkspaceDetailResponse {
  workspace: WorkspaceResponse;
  members: WorkspaceMemberResponse[];
}
