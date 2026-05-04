/**
 * Relationship viewer tool
 * Explore foreign key relationships and load related data
 */

import {
  validateTableName,
  validateRelationDepth,
  executeWithTimeout,
} from '../utils/safety-validators.js';
import { getDatabaseClient } from '../utils/db-connection.js';

interface ExploreRelationshipsInput {
  table: string;
  recordId: string;
  relations?: string[];
  depth?: number;
}

/**
 * Map of table relationships for loading nested data
 */
const RELATIONSHIPS: Record<
  string,
  Array<{ name: string; table: string; foreignKey: string; primaryKey: string }>
> = {
  sections: [{ name: 'page', table: 'pages', foreignKey: 'page_id', primaryKey: 'id' }],
  workspaces: [{ name: 'owner', table: 'users', foreignKey: 'owner_id', primaryKey: 'id' }],
  workspace_members: [
    { name: 'workspace', table: 'workspaces', foreignKey: 'workspace_id', primaryKey: 'id' },
    { name: 'user', table: 'users', foreignKey: 'user_id', primaryKey: 'id' },
  ],
  channels: [{ name: 'workspace', table: 'workspaces', foreignKey: 'workspace_id', primaryKey: 'id' }],
  channel_members: [
    { name: 'channel', table: 'channels', foreignKey: 'channel_id', primaryKey: 'id' },
    { name: 'user', table: 'users', foreignKey: 'user_id', primaryKey: 'id' },
  ],
  messages: [
    { name: 'channel', table: 'channels', foreignKey: 'channel_id', primaryKey: 'id' },
    { name: 'user', table: 'users', foreignKey: 'user_id', primaryKey: 'id' },
  ],
  message_reactions: [
    { name: 'message', table: 'messages', foreignKey: 'message_id', primaryKey: 'id' },
    { name: 'user', table: 'users', foreignKey: 'user_id', primaryKey: 'id' },
  ],
  presence: [
    { name: 'user', table: 'users', foreignKey: 'user_id', primaryKey: 'id' },
    { name: 'channel', table: 'channels', foreignKey: 'channel_id', primaryKey: 'id' },
  ],
  game_sessions: [{ name: 'game', table: 'games', foreignKey: 'game_id', primaryKey: 'id' }],
  player_states: [
    { name: 'session', table: 'game_sessions', foreignKey: 'session_id', primaryKey: 'id' },
    { name: 'user', table: 'users', foreignKey: 'user_id', primaryKey: 'id' },
  ],
  leaderboards: [
    { name: 'game', table: 'games', foreignKey: 'game_id', primaryKey: 'id' },
    { name: 'user', table: 'users', foreignKey: 'user_id', primaryKey: 'id' },
  ],
  posts: [{ name: 'author', table: 'users', foreignKey: 'author_id', primaryKey: 'id' }],
  post_versions: [{ name: 'post', table: 'posts', foreignKey: 'post_id', primaryKey: 'id' }],
  comments: [
    { name: 'post', table: 'posts', foreignKey: 'post_id', primaryKey: 'id' },
    { name: 'author', table: 'users', foreignKey: 'author_id', primaryKey: 'id' },
  ],
  conversation_messages: [
    { name: 'conversation', table: 'conversations', foreignKey: 'conversation_id', primaryKey: 'id' },
    { name: 'user', table: 'users', foreignKey: 'user_id', primaryKey: 'id' },
  ],
  conversation_context: [
    {
      name: 'conversation',
      table: 'conversations',
      foreignKey: 'conversation_id',
      primaryKey: 'id',
    },
  ],
  uploads: [{ name: 'user', table: 'users', foreignKey: 'user_id', primaryKey: 'id' }],
};

/**
 * Fetch a related record
 */
async function fetchRelated(
  client: any,
  rel: (typeof RELATIONSHIPS)[string][0],
  value: unknown,
  depth: number,
  maxDepth: number,
): Promise<unknown> {
  if (depth >= maxDepth) {
    return { id: value }; // Return minimal data at max depth
  }

  const query = `SELECT * FROM "${rel.table}" WHERE "${rel.primaryKey}" = $1 LIMIT 1`;

  const result = await executeWithTimeout(
    (client as any)(query, [value]),
    parseInt(process.env.MAX_QUERY_TIMEOUT || '30000'),
    `Fetch related ${rel.table}`,
  );

  const rows = result as unknown as Record<string, unknown>[];

  if (!rows || rows.length === 0) {
    return null;
  }

  const record = rows[0];

  // Recursively load nested relations if depth allows
  if (RELATIONSHIPS[rel.table]) {
    for (const nestedRel of RELATIONSHIPS[rel.table]) {
      if (record[nestedRel.foreignKey]) {
        record[`_${nestedRel.name}`] = await fetchRelated(
          client,
          nestedRel,
          record[nestedRel.foreignKey],
          depth + 1,
          maxDepth,
        );
      }
    }
  }

  return record;
}

/**
 * Explore relationships for a record
 */
export async function exploreRelationships(
  input: ExploreRelationshipsInput,
): Promise<string> {
  const client = getDatabaseClient();

  try {
    const { table, recordId, relations, depth = 1 } = input;

    // Validate inputs
    if (!validateTableName(table)) {
      return `Error: Table "${table}" not found in schema.`;
    }

    const validatedDepth = validateRelationDepth(
      depth,
      parseInt(process.env.MAX_RELATION_DEPTH || '3'),
    );

    // Fetch the main record
    const mainQuery = `SELECT * FROM "${table}" WHERE "id" = $1 LIMIT 1`;

    const mainResult = await executeWithTimeout(
      (client as any)(mainQuery, [recordId]),
      parseInt(process.env.MAX_QUERY_TIMEOUT || '30000'),
      `Fetch ${table} record`,
    );

    const mainRows = mainResult as unknown as Record<string, unknown>[];

    if (!mainRows || mainRows.length === 0) {
      return `No record found in table "${table}" with id "${recordId}"`;
    }

    const record = mainRows[0];

    // Load relationships
    const applicableRels = RELATIONSHIPS[table] || [];

    for (const rel of applicableRels) {
      // Skip if relations list is provided and doesn't include this relation
      if (relations && !relations.includes(rel.name)) {
        continue;
      }

      const fkValue = record[rel.foreignKey];
      if (fkValue) {
        record[`_${rel.name}`] = await fetchRelated(
          client,
          rel,
          fkValue,
          1,
          validatedDepth,
        );
      }
    }

    // Format output
    const lines: string[] = [];
    lines.push(`Record from table: ${table}`);
    lines.push(`Record ID: ${recordId}`);
    lines.push(`Relationship depth: ${validatedDepth}\n`);
    lines.push(JSON.stringify(record, null, 2));

    return lines.join('\n');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return `Error exploring relationships: ${msg}`;
  } finally {
    await client.end();
  }
}
