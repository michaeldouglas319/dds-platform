import {
  pgTable,
  text,
  serial,
  varchar,
  timestamp,
  jsonb,
  boolean,
  integer,
  decimal,
  uniqueIndex,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const accessLevelEnum = pgEnum('access_level', [
  'everyone',
  'member',
  'member_plus',
  'partner',
  'admin',
]);

export const messageTypeEnum = pgEnum('message_type', [
  'text',
  'image',
  'file',
  'system',
]);

export const channelTypeEnum = pgEnum('channel_type', [
  'public',
  'private',
  'direct',
]);

export const gameStatusEnum = pgEnum('game_status', [
  'waiting',
  'in_progress',
  'completed',
  'cancelled',
]);

export const postStatusEnum = pgEnum('post_status', [
  'draft',
  'published',
  'archived',
]);

// ============================================================================
// CORE TABLES
// ============================================================================

/**
 * Users table - synced from Clerk authentication
 */
export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(), // Clerk user ID
    clerkId: text('clerk_id').notNull().unique(),
    email: text('email').notNull().unique(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    avatarUrl: text('avatar_url'),
    accessLevel: accessLevelEnum('access_level').notNull().default('member'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    clerkIdIdx: index('users_clerk_id_idx').on(table.clerkId),
    emailIdx: index('users_email_idx').on(table.email),
    accessLevelIdx: index('users_access_level_idx').on(table.accessLevel),
  })
);

/**
 * Pages table - top-level pages (resume, ideas, business, etc.)
 */
export const pages = pgTable(
  'pages',
  {
    id: text('id').primaryKey(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    requiredAccessLevel: accessLevelEnum('required_access_level')
      .notNull()
      .default('everyone'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('pages_slug_idx').on(table.slug),
  })
);

/**
 * Sections table - content sections within pages
 */
export const sections = pgTable(
  'sections',
  {
    id: text('id').primaryKey(),
    pageId: text('page_id').notNull().references(() => pages.id, {
      onDelete: 'cascade',
    }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    order: integer('order').notNull(),
    content: jsonb('content').notNull(), // Stores paragraphs, highlights, stats, etc.
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    pageIdIdx: index('sections_page_id_idx').on(table.pageId),
    orderIdx: index('sections_order_idx').on(table.order),
  })
);

// ============================================================================
// MESSAGING TABLES (Teams-like)
// ============================================================================

/**
 * Workspaces table - team workspaces
 */
export const workspaces = pgTable(
  'workspaces',
  {
    id: text('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    avatarUrl: text('avatar_url'),
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    requiredAccessLevel: accessLevelEnum('required_access_level')
      .notNull()
      .default('member'),
    metadata: jsonb('metadata'), // Can contain isGlobal, system flags
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    ownerIdIdx: index('workspaces_owner_id_idx').on(table.ownerId),
    metadataIsGlobalIdx: index('idx_workspaces_metadata_global').on(
      sql`(metadata->>'isGlobal')`
    ),
  })
);

/**
 * Workspace members table
 */
export const workspaceMembers = pgTable(
  'workspace_members',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 50 }).notNull().default('member'), // 'owner', 'admin', 'member'
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => ({
    workspaceIdIdx: index('workspace_members_workspace_id_idx').on(
      table.workspaceId
    ),
    userIdIdx: index('workspace_members_user_id_idx').on(table.userId),
  })
);

/**
 * Channels table - chat channels within workspaces
 */
export const channels = pgTable(
  'channels',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    type: channelTypeEnum('type').notNull().default('public'),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    workspaceIdIdx: index('channels_workspace_id_idx').on(table.workspaceId),
    createdByIdx: index('channels_created_by_idx').on(table.createdBy),
  })
);

/**
 * Channel members table - access control for channels
 */
export const channelMembers = pgTable(
  'channel_members',
  {
    id: text('id').primaryKey(),
    channelId: text('channel_id')
      .notNull()
      .references(() => channels.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => ({
    channelIdIdx: index('channel_members_channel_id_idx').on(table.channelId),
    userIdIdx: index('channel_members_user_id_idx').on(table.userId),
  })
);

/**
 * Messages table - chat messages
 */
export const messages: any = pgTable(
  'messages',
  {
    id: text('id').primaryKey(),
    channelId: text('channel_id')
      .notNull()
      .references(() => channels.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'set null' }),
    content: text('content').notNull(),
    type: messageTypeEnum('type').notNull().default('text'),
    replyToId: text('reply_to_id').references(() => (messages as any).id, {
      onDelete: 'set null',
    }),
    metadata: jsonb('metadata'), // attachments, mentions, etc.
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    channelIdIdx: index('messages_channel_id_idx').on(table.channelId),
    userIdIdx: index('messages_user_id_idx').on(table.userId),
    createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
  })
);

/**
 * Message reactions table
 */
export const messageReactions = pgTable(
  'message_reactions',
  {
    id: text('id').primaryKey(),
    messageId: text('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    emoji: varchar('emoji', { length: 10 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    messageIdIdx: index('message_reactions_message_id_idx').on(
      table.messageId
    ),
    userIdIdx: index('message_reactions_user_id_idx').on(table.userId),
  })
);

/**
 * Presence table - online status tracking
 */
export const presence = pgTable(
  'presence',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    workspaceId: text('workspace_id').references(() => workspaces.id, {
      onDelete: 'set null',
    }),
    lastSeen: timestamp('last_seen').defaultNow().notNull(),
    status: varchar('status', { length: 50 }).notNull().default('offline'), // 'online', 'away', 'offline'
  },
  (table) => ({
    userIdIdx: uniqueIndex('presence_user_id_idx').on(table.userId),
    workspaceIdIdx: index('presence_workspace_id_idx').on(table.workspaceId),
  })
);

// ============================================================================
// GAMING TABLES
// ============================================================================

/**
 * Games table - game definitions
 */
export const games = pgTable(
  'games',
  {
    id: text('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    type: varchar('type', { length: 50 }).notNull(), // 'multiplayer', 'turn-based', etc.
    config: jsonb('config').notNull(), // game-specific configuration
    requiredAccessLevel: accessLevelEnum('required_access_level')
      .notNull()
      .default('member'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    typeIdx: index('games_type_idx').on(table.type),
  })
);

/**
 * Game sessions table - active/completed matches
 */
export const gameSessions = pgTable(
  'game_sessions',
  {
    id: text('id').primaryKey(),
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    status: gameStatusEnum('status').notNull().default('waiting'),
    maxPlayers: integer('max_players').notNull().default(4),
    startedAt: timestamp('started_at'),
    endedAt: timestamp('ended_at'),
    winner: text('winner'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    gameIdIdx: index('game_sessions_game_id_idx').on(table.gameId),
    statusIdx: index('game_sessions_status_idx').on(table.status),
  })
);

/**
 * Player states table - player positions and state in games
 * Ephemeral - not persisted in real-time, only final scores
 */
export const playerStates = pgTable(
  'player_states',
  {
    id: text('id').primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => gameSessions.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    position: jsonb('position').notNull(), // { x, y, z }
    score: integer('score').notNull().default(0),
    status: varchar('status', { length: 50 }).notNull().default('active'), // 'active', 'eliminated', 'spectating'
    metadata: jsonb('metadata'), // game-specific state
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    sessionIdIdx: index('player_states_session_id_idx').on(table.sessionId),
    userIdIdx: index('player_states_user_id_idx').on(table.userId),
  })
);

/**
 * Leaderboards table - high scores and rankings
 */
export const leaderboards = pgTable(
  'leaderboards',
  {
    id: text('id').primaryKey(),
    gameId: text('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    score: integer('score').notNull(),
    rank: integer('rank').notNull(),
    wins: integer('wins').notNull().default(0),
    losses: integer('losses').notNull().default(0),
    lastPlayedAt: timestamp('last_played_at').defaultNow().notNull(),
  },
  (table) => ({
    gameIdIdx: index('leaderboards_game_id_idx').on(table.gameId),
    userIdIdx: index('leaderboards_user_id_idx').on(table.userId),
    scoreIdx: index('leaderboards_score_idx').on(table.score),
  })
);

// ============================================================================
// BLOG & DOCUMENTS TABLES
// ============================================================================

/**
 * Posts table - blog posts with Tiptap content
 */
export const posts = pgTable(
  'posts',
  {
    id: text('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    excerpt: text('excerpt'),
    content: jsonb('content').notNull(), // Tiptap JSON
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: postStatusEnum('status').notNull().default('draft'),
    requiredAccessLevel: accessLevelEnum('required_access_level')
      .notNull()
      .default('everyone'),
    tags: text('tags').array(),
    featuredImageUrl: text('featured_image_url'),
    metadata: jsonb('metadata'),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('posts_slug_idx').on(table.slug),
    authorIdIdx: index('posts_author_id_idx').on(table.authorId),
    statusIdx: index('posts_status_idx').on(table.status),
    publishedAtIdx: index('posts_published_at_idx').on(table.publishedAt),
  })
);

/**
 * Post versions table - revision history
 */
export const postVersions = pgTable(
  'post_versions',
  {
    id: text('id').primaryKey(),
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content: jsonb('content').notNull(),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id),
    changesSummary: text('changes_summary'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    postIdIdx: index('post_versions_post_id_idx').on(table.postId),
    versionIdx: index('post_versions_version_idx').on(table.version),
  })
);

/**
 * Comments table - threaded comments on posts
 */
export const comments: any = pgTable(
  'comments',
  {
    id: text('id').primaryKey(),
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    replyToId: text('reply_to_id').references(() => (comments as any).id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    postIdIdx: index('comments_post_id_idx').on(table.postId),
    userIdIdx: index('comments_user_id_idx').on(table.userId),
  })
);

/**
 * Tags table - categorization
 */
export const tags = pgTable(
  'tags',
  {
    id: text('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    description: text('description'),
  },
  (table) => ({
    nameIdx: uniqueIndex('tags_name_idx').on(table.name),
    slugIdx: uniqueIndex('tags_slug_idx').on(table.slug),
  })
);

// ============================================================================
// LLM CHAT TABLES
// ============================================================================

/**
 * Conversations table - chat sessions
 */
export const conversations = pgTable(
  'conversations',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }),
    model: varchar('model', { length: 255 }).notNull().default('gpt-4'),
    systemPrompt: text('system_prompt'),
    requiredAccessLevel: accessLevelEnum('required_access_level')
      .notNull()
      .default('member'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('conversations_user_id_idx').on(table.userId),
    createdAtIdx: index('conversations_created_at_idx').on(table.createdAt),
  })
);

/**
 * Conversation messages table - user and assistant messages
 */
export const conversationMessages = pgTable(
  'conversation_messages',
  {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 50 }).notNull(), // 'user', 'assistant', 'system'
    content: text('content').notNull(),
    tokens: integer('tokens'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    conversationIdIdx: index('conversation_messages_conversation_id_idx').on(
      table.conversationId
    ),
    roleIdx: index('conversation_messages_role_idx').on(table.role),
  })
);

/**
 * Conversation context table - RAG documents with vector embeddings
 * Note: pgvector extension required for embedding column
 */
export const conversationContext = pgTable(
  'conversation_context',
  {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    source: varchar('source', { length: 255 }), // URL, file name, etc.
    embedding: text('embedding'), // Will be vector type after pgvector extension
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    conversationIdIdx: index('conversation_context_conversation_id_idx').on(
      table.conversationId
    ),
  })
);

// ============================================================================
// FILE STORAGE TABLES
// ============================================================================

/**
 * Uploads table - file metadata
 */
export const uploads = pgTable(
  'uploads',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    storagePath: text('storage_path').notNull(), // Supabase Storage path
    url: text('url'),
    relatedTo: text('related_to'), // Post ID, conversation ID, etc.
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('uploads_user_id_idx').on(table.userId),
    createdAtIdx: index('uploads_created_at_idx').on(table.createdAt),
  })
);

// ============================================================================
// CONFIGURATION MANAGEMENT TABLES
// ============================================================================

/**
 * App Configs table - centralized configuration storage
 *
 * Stores all application configurations with version tracking and audit trail.
 * Hierarchical organization: namespace.category.key
 *
 * Examples:
 * - content.resume.jobs
 * - models.shared.tesla
 * - design.tokens.spacing
 */
export const appConfigs: any = pgTable(
  'app_configs',
  {
    id: text('id').primaryKey(),

    // Hierarchical organization
    namespace: varchar('namespace', { length: 100 }).notNull(),
    category: varchar('category', { length: 100 }).notNull(),
    key: varchar('key', { length: 100 }).notNull(),
    fullPath: varchar('full_path', { length: 300 }).notNull().unique(),

    // Config data
    data: jsonb('data').notNull(),
    schema: jsonb('schema'), // JSON Schema for validation
    description: text('description'),
    tags: text('tags').array(),

    // Version tracking
    version: integer('version').notNull().default(1),
    isActive: boolean('is_active').notNull().default(true),

    // Access control
    requiredAccessLevel: accessLevelEnum('required_access_level')
      .notNull()
      .default('member'),
    ownerClerkId: text('owner_clerk_id'),

    // Caching hints
    cacheTTL: integer('cache_ttl').default(3600), // seconds
    immutable: boolean('immutable').notNull().default(false),

    // Relationships
    parentConfigId: text('parent_config_id').references(() => (appConfigs as any).id, {
      onDelete: 'set null',
    }),

    // Audit
    createdBy: text('created_by').notNull(),
    updatedBy: text('updated_by').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    // Composite unique constraint on namespace + category + key
    namespaceKeysIdx: uniqueIndex('app_configs_namespace_keys_idx').on(
      table.namespace,
      table.category,
      table.key
    ),

    // Individual indexes for filtering
    namespaceIdx: index('app_configs_namespace_idx').on(table.namespace),
    categoryIdx: index('app_configs_category_idx').on(table.category),
    fullPathIdx: uniqueIndex('app_configs_full_path_idx').on(table.fullPath),

    // Access control index
    accessLevelIdx: index('app_configs_access_level_idx').on(
      table.requiredAccessLevel
    ),

    // Version and active status
    versionIdx: index('app_configs_version_idx').on(table.version),
    isActiveIdx: index('app_configs_is_active_idx').on(table.isActive),

    // JSONB indexes for common queries
    dataTypeIdx: index('app_configs_data_type_idx').on(
      sql`((data->>'type'))`
    ),
    tagsIdx: index('app_configs_tags_idx').on(table.tags),

    // Audit indexes
    createdByIdx: index('app_configs_created_by_idx').on(table.createdBy),
    updatedAtIdx: index('app_configs_updated_at_idx').on(table.updatedAt),
  })
);

/**
 * App Config Versions table - version history and audit trail
 *
 * Tracks all changes to app_configs with complete version history
 * Following the same pattern as postVersions table
 */
export const appConfigVersions = pgTable(
  'app_config_versions',
  {
    id: text('id').primaryKey(),
    configId: text('config_id')
      .notNull()
      .references(() => appConfigs.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    data: jsonb('data').notNull(),
    schema: jsonb('schema'),
    changesSummary: text('changes_summary'),
    changeType: varchar('change_type', { length: 50 }).notNull(), // 'create', 'update', 'delete', 'rollback'
    diff: jsonb('diff'), // JSON diff/patch for the change
    metadata: jsonb('metadata'), // Snapshot of relevant metadata
    createdBy: text('created_by').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    configIdIdx: index('app_config_versions_config_id_idx').on(table.configId),
    versionIdx: index('app_config_versions_version_idx').on(table.version),
    changeTypeIdx: index('app_config_versions_change_type_idx').on(
      table.changeType
    ),
    createdAtIdx: index('app_config_versions_created_at_idx').on(
      table.createdAt
    ),

    // Composite for efficient version lookups
    configVersionIdx: uniqueIndex('app_config_versions_config_version_idx').on(
      table.configId,
      table.version
    ),
  })
);
