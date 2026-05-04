/**
 * SQL injection prevention and query validation utilities
 */

// Forbidden SQL keywords that indicate write operations
const FORBIDDEN_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'CREATE',
  'ALTER',
  'TRUNCATE',
  'GRANT',
  'REVOKE',
  'EXEC',
  'EXECUTE',
];

// List of valid table names from schema
const VALID_TABLES = [
  'users',
  'pages',
  'sections',
  'workspaces',
  'workspace_members',
  'channels',
  'channel_members',
  'messages',
  'message_reactions',
  'presence',
  'games',
  'game_sessions',
  'player_states',
  'leaderboards',
  'posts',
  'post_versions',
  'comments',
  'tags',
  'conversations',
  'conversation_messages',
  'conversation_context',
  'uploads',
];

/**
 * Validate that a table name exists in the schema
 */
export function validateTableName(tableName: string): boolean {
  if (!tableName || typeof tableName !== 'string') {
    return false;
  }

  const normalized = tableName.toLowerCase().trim();
  return VALID_TABLES.includes(normalized);
}

/**
 * Validate that a column name is safe (alphanumeric, underscores, dots)
 */
export function validateColumnName(columnName: string): boolean {
  if (!columnName || typeof columnName !== 'string') {
    return false;
  }

  // Allow alphanumeric, underscores, and dots (for relations)
  return /^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(columnName);
}

/**
 * Validate SQL query for read-only operations only
 * Rejects INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, etc.
 */
export function validateSqlQuery(sql: string): { valid: boolean; error?: string } {
  if (!sql || typeof sql !== 'string') {
    return { valid: false, error: 'SQL query is required and must be a string' };
  }

  const trimmed = sql.trim().toUpperCase();

  // Check for forbidden keywords at the start
  for (const keyword of FORBIDDEN_KEYWORDS) {
    if (trimmed.startsWith(keyword)) {
      return {
        valid: false,
        error: `${keyword} operations are not allowed. Only SELECT, WITH, EXPLAIN queries are permitted.`,
      };
    }
  }

  // Allow SELECT, WITH, EXPLAIN
  const allowedStarts = ['SELECT', 'WITH', 'EXPLAIN'];
  const isAllowed = allowedStarts.some((start) => trimmed.startsWith(start));

  if (!isAllowed) {
    return {
      valid: false,
      error: 'Only SELECT, WITH, and EXPLAIN queries are allowed.',
    };
  }

  // Additional check: look for forbidden keywords in the middle of query
  for (const keyword of FORBIDDEN_KEYWORDS) {
    // Use word boundaries to avoid false positives
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(sql)) {
      return {
        valid: false,
        error: `${keyword} operations are not allowed.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  page: number | undefined,
  pageSize: number | undefined,
  maxPageSize: number = 100,
): { valid: boolean; error?: string; page: number; pageSize: number } {
  const p = page ?? 1;
  const ps = pageSize ?? 20;

  if (!Number.isInteger(p) || p < 1) {
    return {
      valid: false,
      error: 'Page must be a positive integer',
      page: 1,
      pageSize: ps,
    };
  }

  if (!Number.isInteger(ps) || ps < 1) {
    return {
      valid: false,
      error: 'Page size must be a positive integer',
      page: p,
      pageSize: 20,
    };
  }

  if (ps > maxPageSize) {
    return {
      valid: false,
      error: `Page size cannot exceed ${maxPageSize}`,
      page: p,
      pageSize: maxPageSize,
    };
  }

  return { valid: true, page: p, pageSize: ps };
}

/**
 * Validate query timeout in milliseconds
 */
export function validateTimeout(
  timeout: number | undefined,
  maxTimeout: number = 30000,
): { valid: boolean; error?: string; timeout: number } {
  const t = timeout ?? 10000; // Default 10 seconds

  if (!Number.isInteger(t) || t < 100) {
    return {
      valid: false,
      error: 'Timeout must be an integer >= 100ms',
      timeout: 10000,
    };
  }

  if (t > maxTimeout) {
    return {
      valid: false,
      error: `Timeout cannot exceed ${maxTimeout}ms`,
      timeout: maxTimeout,
    };
  }

  return { valid: true, timeout: t };
}

/**
 * Execute a promise with a timeout
 */
export async function executeWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string = 'Operation',
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs),
    ),
  ]);
}

/**
 * Enforce result row limit
 */
export function enforceResultLimit<T>(rows: T[], maxRows: number = 10000): {
  rows: T[];
  limited: boolean;
} {
  if (rows.length > maxRows) {
    return {
      rows: rows.slice(0, maxRows),
      limited: true,
    };
  }

  return { rows, limited: false };
}

/**
 * Validate order direction
 */
export function validateOrderDirection(dir: string | undefined): 'asc' | 'desc' {
  if (!dir || typeof dir !== 'string') {
    return 'asc';
  }

  const normalized = dir.toLowerCase();
  return normalized === 'desc' ? 'desc' : 'asc';
}

/**
 * Validate relation depth
 */
export function validateRelationDepth(depth: number | undefined, maxDepth: number = 3): number {
  const d = depth ?? 1;

  if (!Number.isInteger(d) || d < 0) {
    return 1;
  }

  return Math.min(d, maxDepth);
}

/**
 * Check if development mode is enabled
 */
export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development';
}
