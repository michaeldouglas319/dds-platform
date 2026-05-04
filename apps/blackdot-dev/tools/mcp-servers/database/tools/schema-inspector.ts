/**
 * Schema inspection tool
 * Provides information about database structure without querying data
 */

import { validateTableName } from '../utils/safety-validators.js';

/**
 * Get all table names from the schema
 */
function getTableNames(): string[] {
  const tables = [
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
  return tables.sort();
}

/**
 * Get all enum definitions from the schema
 */
function getEnums(): Array<{ name: string; values: string[] }> {
  return [
    {
      name: 'access_level',
      values: ['everyone', 'member', 'member_plus', 'partner', 'admin'],
    },
    {
      name: 'message_type',
      values: ['text', 'image', 'file', 'system'],
    },
    {
      name: 'channel_type',
      values: ['public', 'private', 'direct'],
    },
    {
      name: 'game_status',
      values: ['waiting', 'in_progress', 'completed', 'cancelled'],
    },
    {
      name: 'post_status',
      values: ['draft', 'published', 'archived'],
    },
  ];
}

/**
 * Get column information for a specific table
 */
function getTableColumns(tableName: string): Array<{
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  unique: boolean;
  default?: string;
}> {
  // Define table schemas manually for inspection
  const columnMap: Record<string, Array<{
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
    unique: boolean;
    default?: string;
  }>> = {
    users: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true, default: 'Clerk user ID' },
      { name: 'clerk_id', type: 'text', nullable: false, primaryKey: false, unique: true },
      { name: 'email', type: 'text', nullable: false, primaryKey: false, unique: true },
      { name: 'first_name', type: 'text', nullable: true, primaryKey: false, unique: false },
      { name: 'last_name', type: 'text', nullable: true, primaryKey: false, unique: false },
      { name: 'avatar_url', type: 'text', nullable: true, primaryKey: false, unique: false },
      {
        name: 'access_level',
        type: 'access_level enum',
        nullable: false,
        primaryKey: false,
        unique: false,
        default: 'member',
      },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    pages: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'slug', type: 'varchar(255)', nullable: false, primaryKey: false, unique: true },
      { name: 'title', type: 'varchar(255)', nullable: false, primaryKey: false, unique: false },
      { name: 'description', type: 'text', nullable: true, primaryKey: false, unique: false },
      {
        name: 'required_access_level',
        type: 'access_level enum',
        nullable: false,
        primaryKey: false,
        unique: false,
        default: 'everyone',
      },
      { name: 'metadata', type: 'jsonb', nullable: true, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    sections: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'page_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> pages' },
      { name: 'title', type: 'varchar(255)', nullable: false, primaryKey: false, unique: false },
      { name: 'description', type: 'text', nullable: true, primaryKey: false, unique: false },
      { name: 'order', type: 'integer', nullable: false, primaryKey: false, unique: false },
      { name: 'content', type: 'jsonb', nullable: true, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    workspaces: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'name', type: 'varchar(255)', nullable: false, primaryKey: false, unique: false },
      { name: 'owner_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> users' },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    workspace_members: [
      { name: 'id', type: 'serial', nullable: false, primaryKey: true, unique: true },
      { name: 'workspace_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> workspaces' },
      { name: 'user_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> users' },
      { name: 'role', type: 'varchar(50)', nullable: false, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    channels: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'workspace_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> workspaces' },
      { name: 'name', type: 'varchar(255)', nullable: false, primaryKey: false, unique: false },
      { name: 'type', type: 'channel_type enum', nullable: false, primaryKey: false, unique: false, default: 'public' },
      { name: 'description', type: 'text', nullable: true, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    channel_members: [
      { name: 'id', type: 'serial', nullable: false, primaryKey: true, unique: true },
      { name: 'channel_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> channels' },
      { name: 'user_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> users' },
      { name: 'joined_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    messages: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'channel_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> channels' },
      { name: 'user_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> users' },
      { name: 'content', type: 'text', nullable: false, primaryKey: false, unique: false },
      { name: 'type', type: 'message_type enum', nullable: false, primaryKey: false, unique: false, default: 'text' },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    message_reactions: [
      { name: 'id', type: 'serial', nullable: false, primaryKey: true, unique: true },
      { name: 'message_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> messages' },
      { name: 'user_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> users' },
      { name: 'emoji', type: 'varchar(10)', nullable: false, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    presence: [
      { name: 'id', type: 'serial', nullable: false, primaryKey: true, unique: true },
      { name: 'user_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> users' },
      { name: 'channel_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> channels' },
      { name: 'last_seen', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    games: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'title', type: 'varchar(255)', nullable: false, primaryKey: false, unique: false },
      { name: 'description', type: 'text', nullable: true, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    game_sessions: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'game_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> games' },
      { name: 'status', type: 'game_status enum', nullable: false, primaryKey: false, unique: false, default: 'waiting' },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    player_states: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'session_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> game_sessions' },
      { name: 'user_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> users' },
      { name: 'state', type: 'jsonb', nullable: true, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    leaderboards: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'game_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> games' },
      { name: 'user_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> users' },
      { name: 'score', type: 'integer', nullable: false, primaryKey: false, unique: false },
      { name: 'rank', type: 'integer', nullable: false, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    posts: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'author_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> users' },
      { name: 'title', type: 'varchar(255)', nullable: false, primaryKey: false, unique: false },
      { name: 'content', type: 'text', nullable: false, primaryKey: false, unique: false },
      { name: 'status', type: 'post_status enum', nullable: false, primaryKey: false, unique: false, default: 'draft' },
      { name: 'view_count', type: 'integer', nullable: false, primaryKey: false, unique: false, default: '0' },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    post_versions: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'post_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> posts' },
      { name: 'content', type: 'text', nullable: false, primaryKey: false, unique: false },
      { name: 'version_number', type: 'integer', nullable: false, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    comments: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'post_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> posts' },
      { name: 'author_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> users' },
      { name: 'content', type: 'text', nullable: false, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    tags: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'name', type: 'varchar(50)', nullable: false, primaryKey: false, unique: true },
      { name: 'color', type: 'varchar(7)', nullable: true, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    conversations: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'title', type: 'varchar(255)', nullable: false, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    conversation_messages: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'conversation_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> conversations' },
      { name: 'user_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> users' },
      { name: 'content', type: 'text', nullable: false, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    conversation_context: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'conversation_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> conversations' },
      { name: 'context_data', type: 'jsonb', nullable: true, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
    uploads: [
      { name: 'id', type: 'text', nullable: false, primaryKey: true, unique: true },
      { name: 'user_id', type: 'text', nullable: false, primaryKey: false, unique: false, default: 'FK -> users' },
      { name: 'file_url', type: 'text', nullable: false, primaryKey: false, unique: false },
      { name: 'file_name', type: 'varchar(255)', nullable: false, primaryKey: false, unique: false },
      { name: 'file_size', type: 'integer', nullable: false, primaryKey: false, unique: false },
      { name: 'mime_type', type: 'varchar(100)', nullable: false, primaryKey: false, unique: false },
      { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, unique: false, default: 'now()' },
    ],
  };

  return columnMap[tableName] || [];
}

/**
 * Get relationships for a table
 */
function getTableRelationships(tableName: string): Array<{
  column: string;
  referencedTable: string;
  referencedColumn: string;
}> {
  const relationshipMap: Record<
    string,
    Array<{ column: string; referencedTable: string; referencedColumn: string }>
  > = {
    sections: [{ column: 'page_id', referencedTable: 'pages', referencedColumn: 'id' }],
    workspaces: [{ column: 'owner_id', referencedTable: 'users', referencedColumn: 'id' }],
    workspace_members: [
      { column: 'workspace_id', referencedTable: 'workspaces', referencedColumn: 'id' },
      { column: 'user_id', referencedTable: 'users', referencedColumn: 'id' },
    ],
    channels: [{ column: 'workspace_id', referencedTable: 'workspaces', referencedColumn: 'id' }],
    channel_members: [
      { column: 'channel_id', referencedTable: 'channels', referencedColumn: 'id' },
      { column: 'user_id', referencedTable: 'users', referencedColumn: 'id' },
    ],
    messages: [
      { column: 'channel_id', referencedTable: 'channels', referencedColumn: 'id' },
      { column: 'user_id', referencedTable: 'users', referencedColumn: 'id' },
    ],
    message_reactions: [
      { column: 'message_id', referencedTable: 'messages', referencedColumn: 'id' },
      { column: 'user_id', referencedTable: 'users', referencedColumn: 'id' },
    ],
    presence: [
      { column: 'user_id', referencedTable: 'users', referencedColumn: 'id' },
      { column: 'channel_id', referencedTable: 'channels', referencedColumn: 'id' },
    ],
    game_sessions: [{ column: 'game_id', referencedTable: 'games', referencedColumn: 'id' }],
    player_states: [
      { column: 'session_id', referencedTable: 'game_sessions', referencedColumn: 'id' },
      { column: 'user_id', referencedTable: 'users', referencedColumn: 'id' },
    ],
    leaderboards: [
      { column: 'game_id', referencedTable: 'games', referencedColumn: 'id' },
      { column: 'user_id', referencedTable: 'users', referencedColumn: 'id' },
    ],
    posts: [{ column: 'author_id', referencedTable: 'users', referencedColumn: 'id' }],
    post_versions: [{ column: 'post_id', referencedTable: 'posts', referencedColumn: 'id' }],
    comments: [
      { column: 'post_id', referencedTable: 'posts', referencedColumn: 'id' },
      { column: 'author_id', referencedTable: 'users', referencedColumn: 'id' },
    ],
    conversation_messages: [
      { column: 'conversation_id', referencedTable: 'conversations', referencedColumn: 'id' },
      { column: 'user_id', referencedTable: 'users', referencedColumn: 'id' },
    ],
    conversation_context: [
      { column: 'conversation_id', referencedTable: 'conversations', referencedColumn: 'id' },
    ],
    uploads: [{ column: 'user_id', referencedTable: 'users', referencedColumn: 'id' }],
  };

  return relationshipMap[tableName] || [];
}

/**
 * Main schema inspection function
 */
export async function inspectSchema(scope: string, tableName?: string): Promise<string> {
  try {
    // Validate table name if provided
    if (tableName && !validateTableName(tableName)) {
      return `Error: Table "${tableName}" not found in schema`;
    }

    const lines: string[] = [];
    lines.push('=== Database Schema Inspection ===\n');

    if (scope === 'tables' || scope === 'all') {
      lines.push('TABLES:');
      const tables = getTableNames();
      lines.push(`Total: ${tables.length} tables\n`);
      tables.forEach((t) => lines.push(`  - ${t}`));
      lines.push('');
    }

    if (scope === 'enums' || scope === 'all') {
      lines.push('\nENUMS:');
      const enums = getEnums();
      lines.push(`Total: ${enums.length} enums\n`);
      enums.forEach((e) => {
        lines.push(`  - ${e.name}: [${e.values.join(', ')}]`);
      });
      lines.push('');
    }

    if (scope === 'columns' || scope === 'all') {
      if (tableName) {
        lines.push(`\nCOLUMNS FOR TABLE: ${tableName}`);
        const columns = getTableColumns(tableName);
        lines.push(`Total: ${columns.length} columns\n`);
        columns.forEach((col) => {
          const attrs = [];
          if (col.primaryKey) attrs.push('PRIMARY KEY');
          if (col.unique) attrs.push('UNIQUE');
          if (!col.nullable) attrs.push('NOT NULL');
          if (col.default) attrs.push(`DEFAULT ${col.default}`);

          const attrStr = attrs.length > 0 ? ` [${attrs.join(', ')}]` : '';
          lines.push(`  - ${col.name}: ${col.type}${attrStr}`);
        });
      } else {
        lines.push('\nCOLUMNS: Provide tableName to view columns for a specific table');
      }
      lines.push('');
    }

    if (scope === 'relationships' || scope === 'all') {
      if (tableName) {
        lines.push(`\nRELATIONSHIPS FOR TABLE: ${tableName}`);
        const rels = getTableRelationships(tableName);
        if (rels.length === 0) {
          lines.push('  (No foreign key relationships)');
        } else {
          rels.forEach((rel) => {
            lines.push(`  - ${rel.column} → ${rel.referencedTable}.${rel.referencedColumn}`);
          });
        }
      } else {
        lines.push('\nRELATIONSHIPS: Provide tableName to view relationships for a specific table');
      }
      lines.push('');
    }

    return lines.join('\n');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return `Error inspecting schema: ${msg}`;
  }
}
