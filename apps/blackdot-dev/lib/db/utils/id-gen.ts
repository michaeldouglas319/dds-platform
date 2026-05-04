/**
 * Unique ID Generation Utilities
 *
 * Provides consistent, type-safe ID generation across the application.
 * IDs follow the pattern: `{prefix}_{timestamp}_{random}`
 *
 * This replaces scattered inline ID generation throughout API routes.
 *
 * @example
 * const postId = idGenerators.post();           // post_1234567890_abc123
 * const workspaceId = idGenerators.workspace(); // ws_1234567890_abc123
 */

/**
 * Generate a unique ID with the given prefix
 *
 * Format: {prefix}_{timestamp}_{random}
 * - timestamp: 13-digit millisecond timestamp
 * - random: 9-character random string
 *
 * @param prefix - ID prefix (e.g., 'post', 'ws', 'msg')
 * @returns Unique ID string
 *
 * @example
 * generateId('post')  // post_1704067200000_a1b2c3d4e
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Typed ID generators for all domains
 * Ensures consistent prefixes and type safety
 */
export const idGenerators = {
  /** Post ID: post_* */
  post: () => generateId('post'),

  /** Post version ID: pv_* */
  postVersion: () => generateId('pv'),

  /** Workspace ID: ws_* */
  workspace: () => generateId('ws'),

  /** Workspace member ID: wsm_* */
  workspaceMember: () => generateId('wsm'),

  /** Channel ID: ch_* */
  channel: () => generateId('ch'),

  /** Channel member ID: chm_* */
  channelMember: () => generateId('chm'),

  /** Message ID: msg_* */
  message: () => generateId('msg'),

  /** Message reaction ID: react_* */
  messageReaction: () => generateId('react'),

  /** Conversation ID: conv_* */
  conversation: () => generateId('conv'),

  /** Conversation message ID: cmsg_* */
  conversationMessage: () => generateId('cmsg'),

  /** Conversation context ID: ctx_* */
  conversationContext: () => generateId('ctx'),

  /** Game session ID: game_* */
  gameSession: () => generateId('game'),

  /** Player state ID: pstate_* */
  playerState: () => generateId('pstate'),

  /** Upload ID: upload_* */
  upload: () => generateId('upload'),

  /** Comment ID: comment_* */
  comment: () => generateId('comment'),

  /** Tag ID: tag_* */
  tag: () => generateId('tag'),
} as const;

/**
 * Extract prefix from an ID
 * @param id - The ID string
 * @returns The prefix part before the first underscore
 *
 * @example
 * extractPrefix('post_1704067200000_a1b2c3d4e') // 'post'
 */
export function extractPrefix(id: string): string {
  return id.split('_')[0];
}

/**
 * Check if an ID has the expected prefix
 * @param id - The ID to check
 * @param expectedPrefix - The expected prefix
 * @returns true if the ID starts with the expected prefix
 *
 * @example
 * hasPrefix('post_123_abc', 'post') // true
 * hasPrefix('ws_123_abc', 'post')   // false
 */
export function hasPrefix(id: string, expectedPrefix: string): boolean {
  return extractPrefix(id) === expectedPrefix;
}
