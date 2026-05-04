/**
 * Raw SQL execution tool
 * Execute read-only SQL queries (SELECT, WITH, EXPLAIN only)
 */

import {
  validateSqlQuery,
  validateTimeout,
  executeWithTimeout,
  enforceResultLimit,
} from '../utils/safety-validators.js';
import { formatTable } from '../utils/formatters.js';
import { getDatabaseClient } from '../utils/db-connection.js';

interface ExecuteRawSqlInput {
  sql: string;
  params?: unknown[];
  timeout?: number;
}

/**
 * Execute a read-only SQL query
 */
export async function executeRawSql(input: ExecuteRawSqlInput): Promise<string> {
  const client = getDatabaseClient();

  try {
    const { sql, params = [], timeout } = input;

    // Validate SQL query
    const sqlValidation = validateSqlQuery(sql);
    if (!sqlValidation.valid) {
      return `Error: ${sqlValidation.error}`;
    }

    // Validate timeout
    const timeoutValidation = validateTimeout(
      timeout,
      parseInt(process.env.MAX_QUERY_TIMEOUT || '30000'),
    );
    if (!timeoutValidation.valid) {
      return `Error: ${timeoutValidation.error}`;
    }

    const finalTimeout = timeoutValidation.timeout;

    // Validate params
    if (!Array.isArray(params)) {
      return 'Error: Params must be an array';
    }

    // Execute query with timeout
    const result = await executeWithTimeout(
      (client as any)(sql, params),
      finalTimeout,
      'SQL query',
    );

    const rows = result as unknown as Record<string, unknown>[];

    if (!rows || rows.length === 0) {
      return 'Query executed successfully. No results returned.';
    }

    // Enforce result limit
    const { rows: limitedRows, limited } = enforceResultLimit(rows, parseInt(process.env.MAX_RESULT_ROWS || '10000'));

    // Format results
    const lines: string[] = [];
    lines.push('SQL Query Executed Successfully');
    lines.push(`Results: ${limitedRows.length} rows returned\n`);

    if (params.length > 0) {
      lines.push(`Parameters: [${params.map((p) => JSON.stringify(p)).join(', ')}]\n`);
    }

    // Check if this is a count query or single value
    if (
      limitedRows.length === 1 &&
      Object.keys(limitedRows[0]).length === 1 &&
      typeof Object.values(limitedRows[0])[0] === 'number'
    ) {
      const key = Object.keys(limitedRows[0])[0];
      const value = Object.values(limitedRows[0])[0];
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(formatTable(limitedRows));
    }

    if (limited) {
      lines.push(`\n⚠️  Results were limited to ${process.env.MAX_RESULT_ROWS || '10000'} rows`);
    }

    return lines.join('\n');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return `Error executing SQL query: ${msg}`;
  } finally {
    await client.end();
  }
}
