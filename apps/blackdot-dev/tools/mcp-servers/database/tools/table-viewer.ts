/**
 * Table viewer tool
 * Browse table data with optional column selection and filtering
 */

import {
  validateTableName,
  validateColumnName,
  executeWithTimeout,
  enforceResultLimit,
} from '../utils/safety-validators.js';
import { formatTable } from '../utils/formatters.js';
import { getDatabaseClient } from '../utils/db-connection.js';

interface ViewTableDataInput {
  table: string;
  columns?: string[];
  limit?: number;
  offset?: number;
  where?: Record<string, unknown>;
}

/**
 * View table data with optional column selection
 */
export async function viewTableData(input: ViewTableDataInput): Promise<string> {
  const client = getDatabaseClient();

  try {
    const { table, columns, limit = 20, offset = 0, where = {} } = input;

    // Validate inputs
    if (!validateTableName(table)) {
      return `Error: Table "${table}" not found in schema.`;
    }

    // Validate limit
    const maxPageSize = parseInt(process.env.MAX_PAGE_SIZE || '100');
    if (limit > maxPageSize) {
      return `Error: Limit cannot exceed ${maxPageSize}`;
    }

    if (offset < 0) {
      return 'Error: Offset must be >= 0';
    }

    // Validate columns if provided
    if (columns && columns.length > 0) {
      for (const col of columns) {
        if (!validateColumnName(col)) {
          return `Error: Invalid column name "${col}"`;
        }
      }
    }

    // Build column list
    const columnList =
      columns && columns.length > 0 ? columns.map((c) => `"${c}"`).join(', ') : '*';

    // Build WHERE clause
    const whereConditions: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(where)) {
      if (!validateColumnName(key)) {
        return `Error: Invalid filter column "${key}"`;
      }
      whereConditions.push(`"${key}" = $${params.length + 1}`);
      params.push(value);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Build query
    const query = `
      SELECT ${columnList} FROM "${table}"
      ${whereClause}
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    params.push(limit);
    params.push(offset);

    // Execute query
    const result = await executeWithTimeout(
      (client as any)(query, params),
      parseInt(process.env.MAX_QUERY_TIMEOUT || '30000'),
      `View table ${table}`,
    );

    const rows = result as unknown as Record<string, unknown>[];

    if (!rows || rows.length === 0) {
      return `No data found in table "${table}".`;
    }

    // Enforce result limit
    const { rows: limitedRows, limited } = enforceResultLimit(rows, parseInt(process.env.MAX_RESULT_ROWS || '10000'));

    // Format results
    const lines: string[] = [];
    lines.push(`Table: ${table} (showing ${limitedRows.length} of ${rows.length} rows)`);

    if (columns && columns.length > 0) {
      lines.push(`Columns: ${columns.join(', ')}`);
    }

    if (Object.keys(where).length > 0) {
      lines.push(`Filters: ${JSON.stringify(where)}`);
    }

    lines.push('');
    lines.push(formatTable(limitedRows));

    if (limited) {
      lines.push(`\n⚠️  Results were limited to ${process.env.MAX_RESULT_ROWS || '10000'} rows`);
    }

    return lines.join('\n');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return `Error viewing table data: ${msg}`;
  } finally {
    await client.end();
  }
}
