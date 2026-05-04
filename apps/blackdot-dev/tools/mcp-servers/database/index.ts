import dotenv from 'dotenv';

// Load environment variables before anything else
dotenv.config({ path: '.env.local' });

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { isDevelopmentMode } from './utils/safety-validators.js';
import { inspectSchema } from './tools/schema-inspector.js';
import { queryTable } from './tools/query-table.js';
import { viewTableData } from './tools/table-viewer.js';
import { executeRawSql } from './tools/raw-sql.js';
import { exploreRelationships } from './tools/relationship-viewer.js';

// Verify development mode
if (!isDevelopmentMode()) {
  console.error('ERROR: MCP Database Server is development-only.');
  console.error('Set NODE_ENV=development to use this server.');
  process.exit(1);
}

// Define tool schemas for MCP
const TOOLS: Tool[] = [
  {
    name: 'inspect_schema',
    description:
      'Inspect the database schema including tables, columns, enums, and relationships. Use this to understand the database structure.',
    inputSchema: {
      type: 'object',
      properties: {
        scope: {
          type: 'string',
          enum: ['tables', 'columns', 'enums', 'relationships', 'all'],
          description: 'What aspect of the schema to inspect',
        },
        tableName: {
          type: 'string',
          description: 'Optional: specific table to inspect',
        },
      },
      required: ['scope'],
    },
  },
  {
    name: 'query_table',
    description:
      'Query a table with optional filters, ordering, and pagination. Uses Drizzle ORM for type-safe queries.',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Table name to query',
        },
        filters: {
          type: 'object',
          description: 'Filters to apply (equality conditions only)',
        },
        orderBy: {
          type: 'string',
          description: 'Column to order by',
        },
        orderDir: {
          type: 'string',
          enum: ['asc', 'desc'],
          description: 'Sort direction',
        },
        page: {
          type: 'number',
          description: 'Page number (1-indexed)',
        },
        pageSize: {
          type: 'number',
          description: 'Results per page (max 100)',
        },
      },
      required: ['table'],
    },
  },
  {
    name: 'view_table_data',
    description:
      'Browse table data with optional column selection. Useful for exploring table contents with pagination.',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Table name to view',
        },
        columns: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific columns to return (optional)',
        },
        limit: {
          type: 'number',
          description: 'Number of rows to return (max 100)',
        },
        offset: {
          type: 'number',
          description: 'Number of rows to skip',
        },
        where: {
          type: 'object',
          description: 'Simple equality filters',
        },
      },
      required: ['table'],
    },
  },
  {
    name: 'execute_raw_sql',
    description:
      'Execute read-only SQL queries. Only SELECT, WITH, and EXPLAIN queries are allowed. Parameterized queries required for safety.',
    inputSchema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'SQL query (SELECT, WITH, or EXPLAIN only)',
        },
        params: {
          type: 'array',
          description: 'Query parameters for parameterized queries',
        },
        timeout: {
          type: 'number',
          description: 'Query timeout in milliseconds (max 30000)',
        },
      },
      required: ['sql'],
    },
  },
  {
    name: 'explore_relationships',
    description:
      'Explore foreign key relationships and load related data. Useful for understanding how records relate to each other.',
    inputSchema: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          description: 'Table name',
        },
        recordId: {
          type: 'string',
          description: 'Primary key value',
        },
        relations: {
          type: 'array',
          items: { type: 'string' },
          description: 'Relations to include (e.g. ["author", "comments"])',
        },
        depth: {
          type: 'number',
          description: 'Nesting depth (max 3)',
        },
      },
      required: ['table', 'recordId'],
    },
  },
];

/**
 * Main MCP Server Implementation
 */
class DatabaseServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'dds-database',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    // Setup handlers
    this.setupHandlers();
  }

  private setupHandlers() {
    // Register tools/list handler
    (this.server.setRequestHandler as any)(
      { type: 'tools/list' },
      async () => ({
        tools: TOOLS,
      }),
    );

    // Register tools/call handler
    (this.server.setRequestHandler as any)(
      { type: 'tools/call' },
      async (request: any) => this.handleCallTool(request),
    );
  }

  /**
   * Handle tool call requests
   */
  private async handleCallTool(request: any) {
    const { name } = request.params;
    const args = request.params.arguments as Record<string, unknown> | undefined;

    try {
      switch (name) {
        case 'inspect_schema':
          return {
            content: [
              {
                type: 'text' as const,
                text: await inspectSchema(
                  (args?.scope as string) || 'all',
                  args?.tableName as string | undefined,
                ),
              },
            ],
          };

        case 'query_table':
          return {
            content: [
              {
                type: 'text' as const,
                text: await queryTable({
                  table: args?.table as string,
                  filters: args?.filters as Record<string, unknown> | undefined,
                  orderBy: args?.orderBy as string | undefined,
                  orderDir: args?.orderDir as 'asc' | 'desc' | undefined,
                  page: args?.page as number | undefined,
                  pageSize: args?.pageSize as number | undefined,
                }),
              },
            ],
          };

        case 'view_table_data':
          return {
            content: [
              {
                type: 'text' as const,
                text: await viewTableData({
                  table: args?.table as string,
                  columns: args?.columns as string[] | undefined,
                  limit: args?.limit as number | undefined,
                  offset: args?.offset as number | undefined,
                  where: args?.where as Record<string, unknown> | undefined,
                }),
              },
            ],
          };

        case 'execute_raw_sql':
          return {
            content: [
              {
                type: 'text' as const,
                text: await executeRawSql({
                  sql: args?.sql as string,
                  params: args?.params as unknown[] | undefined,
                  timeout: args?.timeout as number | undefined,
                }),
              },
            ],
          };

        case 'explore_relationships':
          return {
            content: [
              {
                type: 'text' as const,
                text: await exploreRelationships({
                  table: args?.table as string,
                  recordId: args?.recordId as string,
                  relations: args?.relations as string[] | undefined,
                  depth: args?.depth as number | undefined,
                }),
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Start the server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[MCP Database Server] Connected and ready for requests');
  }
}

// Main entry point
async function main() {
  try {
    const server = new DatabaseServer();
    await server.start();
  } catch (error) {
    console.error('[MCP Database Server] Fatal error:', error);
    process.exit(1);
  }
}

main();
