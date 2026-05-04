/**
 * Database and API Error Handling
 *
 * Provides typed error classes for consistent error handling across API routes.
 * All errors include HTTP status codes and error codes for standardized responses.
 *
 * @example
 * throw new NotFoundError('Post not found');
 * throw new ForbiddenError('You can only modify your own posts');
 * throw new ValidationError('Invalid post slug');
 */

/**
 * Base error class with HTTP status code and error code
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * 401 Unauthorized - User not authenticated
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * 403 Forbidden - User authenticated but lacks permission
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * 404 Not Found - Resource does not exist
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * 409 Conflict - Resource already exists or conflicts with existing data
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * 400 Bad Request - Invalid input or validation error
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/**
 * Convert unknown database errors to AppError
 * Handles PostgreSQL constraint violations and other common errors
 *
 * @param error - The caught error
 * @param operation - Description of operation that failed (e.g., 'create post')
 * @returns AppError instance with appropriate status code
 *
 * @example
 * try {
 *   await db.insert(posts).values(data);
 * } catch (error) {
 *   throw handleDbError(error, 'create post');
 * }
 */
export function handleDbError(error: unknown, operation: string): AppError {
  // Log the raw error for debugging
  console.error(`Database error during ${operation}:`, error);

  // If already an AppError, return as-is
  if (error instanceof AppError) {
    return error;
  }

  // Parse Error instances
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Postgres unique constraint violation (duplicate key)
    if (message.includes('duplicate') || message.includes('unique')) {
      return new ConflictError('Resource already exists');
    }

    // Postgres foreign key violation
    if (message.includes('foreign key')) {
      return new ValidationError('Invalid reference or missing required resource');
    }

    // Postgres NOT NULL constraint violation
    if (message.includes('not null')) {
      return new ValidationError('Missing required field');
    }

    // PostgreSQL syntax/permission errors
    if (message.includes('permission denied') || message.includes('permission')) {
      return new ForbiddenError('Database permission denied');
    }
  }

  // Generic internal error
  return new AppError(
    `Failed to ${operation}`,
    500,
    'INTERNAL_ERROR'
  );
}
