/**
 * Query table tool
 * Query database tables using raw SQL with filters, ordering, and pagination
 */

import {
  validateTableName,
  validatePagination,
  validateOrderDirection,
  executeWithTimeout,
  enforceResultLimit,
} from '../utils/safety-validators.js';
import { formatTable, formatPaginationInfo } from '../utils/formatters.js';
import { getDatabaseClient } from '../utils/db-connection.js';

interface QueryTableInput {
  table: string;
  filters?: Record<string, unknown>;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * Query a table with optional filters, ordering, and pagination
 */
export async function queryTable(input: QueryTableInput): Promise<string> {
  const client = getDatabaseClient();

  try {
    const { table, filters = {}, orderBy, page, pageSize } = input;

    // Validate inputs
    if (!validateTableName(table)) {
      return `Error: Table "${table}" not found in schema. Use inspect_schema to see available tables.`;
    }

    const paginationValidation = validatePagination(page, pageSize);
    if (!paginationValidation.valid) {
      return `Error: ${paginationValidation.error}`;
    }

    const validatedPage = paginationValidation.page;
    const validatedPageSize = paginationValidation.pageSize;

    // Build WHERE clause from filters
    const whereConditions: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(filters)) {
      whereConditions.push(`"${key}" = $${params.length + 1}`);
      params.push(value);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Build ORDER clause
    let orderClause = '';
    if (orderBy) {
      const direction = validateOrderDirection(input.orderDir) === 'desc' ? 'DESC' : 'ASC';
      orderClause = `ORDER BY "${orderBy}" ${direction}`;
    }

    // Calculate offset
    const offset = (validatedPage - 1) * validatedPageSize;

    // Build the query
    const query = `
      SELECT * FROM "${table}"
      ${whereClause}
      ${orderClause}
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    params.push(validatedPageSize);
    params.push(offset);

    // Execute query with timeout
    const result = await executeWithTimeout(
      (client as any)(query, params),
      parseInt(process.env.MAX_QUERY_TIMEOUT || '30000'),
      `Query on table ${table}`,
    );

    const rows = result as unknown as Record<string, unknown>[];

    if (!rows || rows.length === 0) {
      return `No data found in table "${table}"${whereClause ? ' matching the filters' : ''}.`;
    }

    // Enforce result limit
    const { rows: limitedRows, limited } = enforceResultLimit(rows, parseInt(process.env.MAX_RESULT_ROWS || '10000'));

    // Format results
    const lines: string[] = [];
    lines.push(`Query Results for table: ${table}`);
    lines.push(`Pagination: ${formatPaginationInfo(validatedPage, validatedPageSize, limitedRows.length)}\n`);

    if (whereClause) {
      lines.push(`Filters: ${JSON.stringify(filters)}\n`);
    }

    lines.push(formatTable(limitedRows));

    if (limited) {
      lines.push(`\n⚠️  Results were limited to ${process.env.MAX_RESULT_ROWS || '10000'} rows`);
    }

    return lines.join('\n');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return `Error querying table: ${msg}`;
  } finally {
    await client.end();
  }
}
