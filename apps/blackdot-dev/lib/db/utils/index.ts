/**
 * Database Utilities Barrel Exports
 *
 * Re-exports all database utilities for convenient importing.
 *
 * @example
 * import {
 *   requireAuth,
 *   ensureUserExists,
 *   withPagination,
 *   AppError,
 *   idGenerators,
 * } from '@/lib/db/utils';
 */

// Error handling
export {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  handleDbError,
} from './errors';

// ID generation
export { generateId, idGenerators, extractPrefix, hasPrefix } from './id-gen';

// Authentication & authorization
export {
  requireAuth,
  requireOwnership,
  requireWorkspaceMember,
  requireChannelMember,
  requireAccessLevel,
} from './auth';

// User synchronization
export {
  ensureUserExists,
  batchEnsureUsersExist,
  getOrSyncUser,
  syncUserProfile,
} from './user-sync';

// Query building
export {
  withPagination,
  getTotalPages,
  buildPaginatedResponse,
  relationColumns,
  userSelectColumns,
  type PaginationOptions,
  type PaginationParams,
  type PaginatedResult,
  type FilterOptions,
} from './queries';

// Transactions
export {
  withTransaction,
  createWithRelated,
  withMultiOp,
  ifThen,
  withRetry,
} from './transactions';
