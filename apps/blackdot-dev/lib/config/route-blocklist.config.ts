/**
 * Route Blocklist Configuration
 * 
 * Routes that should be excluded from:
 * - Public route discovery
 * - Dashboard views
 * - Navigation menus
 * - Search results
 * - All deployment views
 * 
 * Use this for:
 * - Development/test routes
 * - Admin-only internal routes
 * - Deprecated routes
 * - Routes under construction
 */

export interface BlocklistEntry {
  path: string
  reason: string
  excludeFrom?: ('discovery' | 'dashboard' | 'navigation' | 'search' | 'all')[]
}

/**
 * Routes blocked from ALL views (discovery, dashboard, navigation, search)
 */
export const BLOCKED_ROUTES: string[] = [
  '/api', // API routes
  '/_next', // Next.js internal
  '/login', // Auth routes (handled separately)
  '/test-camera', // Test pages
  '/test-camera-resume', // Test pages
  '/loaders-showcase', // Development showcase
  '/showcase-examples', // Development examples
  '/transitions-showcase', // Development showcase
  '/tier1-demo', // Demo pages
  '/unauthorized', // Error pages
  '/admin', // Admin routes (should use access level instead)
]

/**
 * Routes blocked from public discovery but available to authenticated users
 */
export const BLOCKED_FROM_PUBLIC: string[] = [
  '/dashboard', // User dashboard
  '/partner', // Partner-only
  '/premium', // Premium-only
]

/**
 * Routes blocked from navigation menus but still discoverable
 */
export const BLOCKED_FROM_NAVIGATION: string[] = [
  '/ideas/composites', // Sub-routes
  '/ideas/general', // Sub-routes
  '/ideas/umbrellav1', // Sub-routes
  '/business/[sectionId]', // Dynamic routes
  '/ideas/[sectionId]', // Dynamic routes
]

/**
 * Detailed blocklist with reasons and granular control
 */
export const ROUTE_BLOCKLIST: BlocklistEntry[] = [
  {
    path: '/api',
    reason: 'API routes - not user-facing pages',
    excludeFrom: ['all'],
  },
  {
    path: '/_next',
    reason: 'Next.js internal routes',
    excludeFrom: ['all'],
  },
  {
    path: '/login',
    reason: 'Authentication handled separately',
    excludeFrom: ['all'],
  },
  {
    path: '/test-camera',
    reason: 'Development test page',
    excludeFrom: ['all'],
  },
  {
    path: '/test-camera-resume',
    reason: 'Development test page',
    excludeFrom: ['all'],
  },
  {
    path: '/loaders-showcase',
    reason: 'Development showcase',
    excludeFrom: ['all'],
  },
  {
    path: '/showcase-examples',
    reason: 'Development examples',
    excludeFrom: ['all'],
  },
  {
    path: '/transitions-showcase',
    reason: 'Development showcase',
    excludeFrom: ['all'],
  },
  {
    path: '/tier1-demo',
    reason: 'Demo page',
    excludeFrom: ['all'],
  },
  {
    path: '/unauthorized',
    reason: 'Error page - not a destination',
    excludeFrom: ['all'],
  },
  {
    path: '/dashboard',
    reason: 'User dashboard - access controlled',
    excludeFrom: ['discovery', 'navigation'],
  },
  {
    path: '/ideas/composites',
    reason: 'Sub-route - use parent /ideas',
    excludeFrom: ['navigation'],
  },
  {
    path: '/ideas/general',
    reason: 'Sub-route - use parent /ideas',
    excludeFrom: ['navigation'],
  },
  {
    path: '/ideas/umbrellav1',
    reason: 'Sub-route - use parent /ideas',
    excludeFrom: ['navigation'],
  },
  {
    path: '/business/[sectionId]',
    reason: 'Dynamic route - use parent /business',
    excludeFrom: ['navigation'],
  },
  {
    path: '/ideas/[sectionId]',
    reason: 'Dynamic route - use parent /ideas',
    excludeFrom: ['navigation'],
  },
]

/**
 * Check if a route is blocked
 */
export function isRouteBlocked(
  path: string,
  context: 'discovery' | 'dashboard' | 'navigation' | 'search' | 'all' = 'all'
): boolean {
  // Check exact matches
  if (context === 'all' && BLOCKED_ROUTES.includes(path)) {
    return true
  }

  // Check pattern matches
  for (const entry of ROUTE_BLOCKLIST) {
    if (entry.excludeFrom?.includes(context) || entry.excludeFrom?.includes('all')) {
      // Exact match
      if (entry.path === path) {
        return true
      }
      // Pattern match (for dynamic routes)
      if (entry.path.includes('[') && entry.path.includes(']')) {
        const pattern = entry.path.replace(/\[.*?\]/g, '[^/]+')
        const regex = new RegExp(`^${pattern}$`)
        if (regex.test(path)) {
          return true
        }
      }
    }
  }

  return false
}

/**
 * Filter routes by blocklist
 */
export function filterBlockedRoutes<T extends { path: string }>(
  routes: T[],
  context: 'discovery' | 'dashboard' | 'navigation' | 'search' | 'all' = 'all'
): T[] {
  return routes.filter((route) => !isRouteBlocked(route.path, context))
}

/**
 * Get blocklist reason for a route
 */
export function getBlocklistReason(path: string): string | null {
  const entry = ROUTE_BLOCKLIST.find((e) => {
    if (e.path === path) return true
    if (e.path.includes('[') && e.path.includes(']')) {
      const pattern = e.path.replace(/\[.*?\]/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(path)
    }
    return false
  })
  return entry?.reason || null
}
