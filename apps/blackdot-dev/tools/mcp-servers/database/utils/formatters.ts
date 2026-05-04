/**
 * Result formatting utilities for query results
 */

/**
 * Format a database result for display
 */
export function formatQueryResult(result: unknown): string {
  if (result === null) {
    return 'null';
  }

  if (result === undefined) {
    return 'undefined';
  }

  if (typeof result === 'string' || typeof result === 'number' || typeof result === 'boolean') {
    return String(result);
  }

  if (result instanceof Date) {
    return result.toISOString();
  }

  if (Array.isArray(result)) {
    return JSON.stringify(result, null, 2);
  }

  if (typeof result === 'object') {
    return JSON.stringify(result, null, 2);
  }

  return String(result);
}

/**
 * Format a row of data for display
 */
export function formatRow(row: Record<string, unknown>): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const [key, value] of Object.entries(row)) {
    formatted[key] = formatQueryResult(value);
  }

  return formatted;
}

/**
 * Format multiple rows for display
 */
export function formatRows(rows: Record<string, unknown>[]): Record<string, string>[] {
  return rows.map((row) => formatRow(row));
}

/**
 * Format schema metadata for display
 */
export function formatTableSchema(
  tableName: string,
  columns: Array<{ name: string; type: string; nullable: boolean; defaultValue?: unknown }>,
): string {
  const lines = [
    `Table: ${tableName}`,
    `Columns (${columns.length}):`,
    ...columns.map(
      (col) =>
        `  - ${col.name}: ${col.type}${col.nullable ? ' (nullable)' : ''}${col.defaultValue ? ` = ${col.defaultValue}` : ''}`,
    ),
  ];

  return lines.join('\n');
}

/**
 * Format an error for display
 */
export function formatError(error: Error | string): string {
  if (typeof error === 'string') {
    return error;
  }

  const message = error.message || 'Unknown error';
  const stack = error.stack ? `\n${error.stack}` : '';

  return `${message}${stack}`;
}

/**
 * Format pagination info
 */
export function formatPaginationInfo(page: number, pageSize: number, total: number): string {
  const totalPages = Math.ceil(total / pageSize);
  const startRow = (page - 1) * pageSize + 1;
  const endRow = Math.min(page * pageSize, total);

  return `Page ${page} of ${totalPages} (showing ${startRow}-${endRow} of ${total} rows)`;
}

/**
 * Format a table for display
 */
export function formatTable(
  rows: Record<string, unknown>[],
): string {
  if (rows.length === 0) {
    return 'No rows found';
  }

  // Get all column names
  const columns = Object.keys(rows[0]);

  // Calculate column widths
  const widths: Record<string, number> = {};
  for (const col of columns) {
    widths[col] = Math.min(col.length, 30);

    for (const row of rows) {
      const value = String(row[col] ?? '');
      widths[col] = Math.min(Math.max(widths[col], value.length), 30);
    }
  }

  // Build header
  const header = columns.map((col) => col.padEnd(widths[col])).join(' | ');
  const separator = columns.map((col) => ''.padEnd(widths[col], '-')).join('-+-');

  // Build rows
  const formattedRows = rows.map((row) =>
    columns
      .map((col) => {
        const value = String(row[col] ?? '');
        const truncated = value.length > widths[col] ? value.substring(0, widths[col] - 3) + '...' : value;
        return truncated.padEnd(widths[col]);
      })
      .join(' | '),
  );

  return [header, separator, ...formattedRows].join('\n');
}
