import type { AccessLevelType } from './auth.types';

/**
 * @deprecated Roles are now stored in the database (users.access_level).
 * This type is kept for webhook processing but role data is sourced from database.
 * Extended Clerk user metadata with access level
 */
export interface ClerkPublicMetadata {
  role: AccessLevelType;
  assignedAt?: number; // Unix timestamp
  assignedBy?: string; // Admin user ID who assigned the role
}

/**
 * Clerk webhook event types
 */
export interface ClerkWebhookEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
