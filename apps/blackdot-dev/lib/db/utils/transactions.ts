/**
 * Database Transaction Helpers
 *
 * Provides utilities for executing database operations atomically.
 * Transactions ensure that either all operations succeed or all fail.
 *
 * @example
 * // Create post and initial version atomically
 * const { post, version } = await createWithRelated(
 *   (tx) => tx.insert(posts).values(...),
 *   (tx, post) => tx.insert(postVersions).values({ postId: post.id, ... }),
 * );
 */

import { db } from '@/lib/db';

/**
 * Execute operations within a database transaction
 *
 * Automatically rolls back if an error occurs.
 *
 * @param callback - Async function that receives the transaction client
 * @returns The result of the callback
 * @throws Any error thrown by the callback or database
 *
 * @example
 * const result = await withTransaction(async (tx) => {
 *   await tx.insert(posts).values({ ... });
 *   await tx.insert(postVersions).values({ ... });
 *   return { success: true };
 * });
 */
export async function withTransaction<T>(
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    return await callback(tx as unknown as typeof db);
  });
}

/**
 * Create a primary resource with related resources atomically
 *
 * Useful for operations that create a resource and dependent records.
 * For example: create a post and its initial version in one transaction.
 *
 * @param create - Function that creates the primary resource
 * @param createRelated - Function that creates related resources, receives the primary
 * @returns Object with primary and related resources
 * @throws Any error thrown by either function
 *
 * @example
 * const { primary: post, related: version } = await createWithRelated(
 *   (tx) => tx.insert(posts).values({
 *     id: 'post_123',
 *     title: 'My Post',
 *     content: '...',
 *   }),
 *   (tx, post) => tx.insert(postVersions).values({
 *     id: 'pv_456',
 *     postId: post.id,
 *     version: 1,
 *     content: post.content,
 *   }),
 * );
 */
export async function createWithRelated<T, R>(
  create: (tx: typeof db) => Promise<T>,
  createRelated: (tx: typeof db, primary: T) => Promise<R>
): Promise<{ primary: T; related: R }> {
  return await withTransaction(async (tx) => {
    // Create primary resource
    const primary = await create(tx as typeof db);

    // Create related resources
    const related = await createRelated(tx as typeof db, primary);

    return { primary, related };
  });
}

/**
 * Execute multiple operations that may update or delete resources
 *
 * Useful for complex update scenarios with multiple related updates.
 *
 * @param callback - Async function that performs multiple operations
 * @returns The result of the callback
 * @throws Any error thrown by the callback
 *
 * @example
 * const result = await withMultiOp(async (tx) => {
 *   // Update post
 *   await tx.update(posts).set({ ... }).where(...);
 *   // Delete old versions
 *   await tx.delete(postVersions).where(...);
 *   // Insert new version
 *   await tx.insert(postVersions).values(...);
 *   return { updated: true };
 * });
 */
export async function withMultiOp<T>(
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  // Alias for withTransaction - provides semantic clarity for non-create operations
  return withTransaction(callback);
}

/**
 * Execute a callback if a condition is true
 *
 * Shorthand for conditional transaction execution.
 *
 * @param condition - Boolean condition
 * @param callback - Function to execute if condition is true
 * @returns The result of the callback, or undefined if condition is false
 *
 * @example
 * await ifThen(
 *   userExists,
 *   (tx) => tx.delete(users).where(eq(users.id, userId)),
 * );
 */
export async function ifThen<T>(
  condition: boolean,
  callback: (tx: typeof db) => Promise<T>
): Promise<T | undefined> {
  if (!condition) {
    return undefined;
  }

  return await withTransaction(callback);
}

/**
 * Retry a transaction operation with exponential backoff
 *
 * Useful for operations that may fail due to lock contention.
 *
 * @param callback - Async function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param initialDelay - Initial delay in milliseconds (default: 100)
 * @returns The result of the callback
 * @throws Error if all retries are exhausted
 *
 * @example
 * const result = await withRetry(
 *   (tx) => tx.insert(posts).values(...),
 *   3,
 *   100,
 * );
 */
export async function withRetry<T>(
  callback: (tx: typeof db) => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 100
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withTransaction(callback);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on the last attempt
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Transaction failed');
}
