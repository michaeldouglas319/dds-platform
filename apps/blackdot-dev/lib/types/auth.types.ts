/**
 * Access level hierarchy for DDS V3
 * Everyone < Member < Member+ < Partner < Admin
 */
export const AccessLevel = {
  EVERYONE: 'everyone',      // Public/unauthenticated
  MEMBER: 'member',          // Authenticated basic user
  MEMBER_PLUS: 'member_plus', // Authenticated premium user
  PARTNER: 'partner',        // Authenticated business partner
  ADMIN: 'admin',            // System administrator
} as const;

export type AccessLevelType = typeof AccessLevel[keyof typeof AccessLevel];

/**
 * Numeric weights for role comparison
 */
export const AccessLevelWeight: Record<AccessLevelType, number> = {
  [AccessLevel.EVERYONE]: 0,
  [AccessLevel.MEMBER]: 1,
  [AccessLevel.MEMBER_PLUS]: 2,
  [AccessLevel.PARTNER]: 3,
  [AccessLevel.ADMIN]: 4,
};

/**
 * Display names for roles
 */
export const AccessLevelLabels: Record<AccessLevelType, string> = {
  [AccessLevel.EVERYONE]: 'Everyone',
  [AccessLevel.MEMBER]: 'Member',
  [AccessLevel.MEMBER_PLUS]: 'Member+',
  [AccessLevel.PARTNER]: 'Partner',
  [AccessLevel.ADMIN]: 'Admin',
};

/**
 * Role descriptions for admin UI
 */
export const AccessLevelDescriptions: Record<AccessLevelType, string> = {
  [AccessLevel.EVERYONE]: 'Public access - no authentication required',
  [AccessLevel.MEMBER]: 'Basic authenticated user with standard features',
  [AccessLevel.MEMBER_PLUS]: 'Premium member with enhanced features',
  [AccessLevel.PARTNER]: 'Business partner with collaboration features',
  [AccessLevel.ADMIN]: 'Full system administrator access',
};

/**
 * Badge color variants for role display
 */
export const AccessLevelColors: Record<AccessLevelType, string> = {
  [AccessLevel.EVERYONE]: 'secondary',
  [AccessLevel.MEMBER]: 'default',
  [AccessLevel.MEMBER_PLUS]: 'outline',
  [AccessLevel.PARTNER]: 'default',
  [AccessLevel.ADMIN]: 'destructive',
};
