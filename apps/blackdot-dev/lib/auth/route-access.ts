import { AccessLevel, type AccessLevelType } from '@/lib/types/auth.types'

/**
 * Route access configuration - SINGLE SOURCE OF TRUTH
 *
 * This configuration:
 * 1. Reads from registry (routes.json)
 * 2. Defines which routes require which access levels
 * 3. Used by middleware, layouts, and components
 * 4. Future route additions MUST update this file
 */

export interface RouteAccessRule {
  path: string | string[]  // Supports wildcards
  requiredLevel: AccessLevelType
  redirectOnFail?: string
}

// Convert registry to route matchers
export const ROUTE_ACCESS_RULES: RouteAccessRule[] = [
  // Public routes (EVERYONE)
  { path: '/', requiredLevel: AccessLevel.EVERYONE },
  { path: '/landing-v3', requiredLevel: AccessLevel.EVERYONE },
  { path: '/login', requiredLevel: AccessLevel.EVERYONE },
  { path: '/sign-in', requiredLevel: AccessLevel.EVERYONE },
  { path: '/sign-up', requiredLevel: AccessLevel.EVERYONE },
  { path: '/unauthorized', requiredLevel: AccessLevel.EVERYONE },

  // MEMBER routes (members only see Resume + Prediction in landing nav)
  { path: '/dashboard', requiredLevel: AccessLevel.MEMBER },
  { path: '/resumev3', requiredLevel: AccessLevel.MEMBER },
  { path: '/prediction', requiredLevel: AccessLevel.MEMBER },
  { path: '/about', requiredLevel: AccessLevel.MEMBER },
  { path: '/business', requiredLevel: AccessLevel.MEMBER },
  { path: '/forces', requiredLevel: AccessLevel.MEMBER },
  { path: '/aerosim', requiredLevel: AccessLevel.MEMBER },
  { path: '/particle-simulator', requiredLevel: AccessLevel.MEMBER },
  { path: '/showcase', requiredLevel: AccessLevel.MEMBER },
  { path: '/showcase-examples', requiredLevel: AccessLevel.MEMBER },
  { path: '/resume-parallax', requiredLevel: AccessLevel.MEMBER },
  { path: '/test-camera', requiredLevel: AccessLevel.MEMBER },
  { path: '/tier1-demo', requiredLevel: AccessLevel.MEMBER },

  // MEMBER_PLUS routes (tier above member; addition is Ideas)
  { path: '/ideas', requiredLevel: AccessLevel.MEMBER_PLUS },
  { path: '/premium', requiredLevel: AccessLevel.MEMBER_PLUS },
  { path: '/chat', requiredLevel: AccessLevel.MEMBER_PLUS },
  { path: '/configurator', requiredLevel: AccessLevel.MEMBER_PLUS },
  { path: '/influences', requiredLevel: AccessLevel.MEMBER_PLUS },
  { path: '/particle-interaction', requiredLevel: AccessLevel.MEMBER_PLUS },

  // PARTNER routes
  { path: '/partner', requiredLevel: AccessLevel.PARTNER },

  // ADMIN routes (CRITICAL - These were unprotected)
  { path: '/admin', requiredLevel: AccessLevel.ADMIN },
  { path: '/blog', requiredLevel: AccessLevel.ADMIN },
  { path: '/attractors-particles', requiredLevel: AccessLevel.ADMIN },
  { path: '/curved-takeoff-orbit', requiredLevel: AccessLevel.ADMIN },
  { path: '/homev2', requiredLevel: AccessLevel.ADMIN },
  { path: '/resumev4', requiredLevel: AccessLevel.ADMIN },
  { path: '/path-orbit-simple', requiredLevel: AccessLevel.ADMIN },
  { path: '/loaders-showcase', requiredLevel: AccessLevel.ADMIN },
  { path: '/transitions-showcase', requiredLevel: AccessLevel.ADMIN },
  { path: '/selection-showcase', requiredLevel: AccessLevel.ADMIN },
  { path: '/advanced-functions', requiredLevel: AccessLevel.ADMIN },
  { path: '/demos/physics-character-controller', requiredLevel: AccessLevel.ADMIN },
  { path: '/test-undefined-route', requiredLevel: AccessLevel.ADMIN },
]

// Helper to get required level for a path
export function getRequiredAccessLevel(path: string): AccessLevelType {
  // Check exact matches first
  const exactMatch = ROUTE_ACCESS_RULES.find(rule => rule.path === path)
  if (exactMatch) return exactMatch.requiredLevel

  // Check wildcard matches (e.g., /blog matches /blog/*)
  const wildcardMatch = ROUTE_ACCESS_RULES.find(rule => {
    if (typeof rule.path === 'string') {
      return path.startsWith(rule.path)
    }
    return rule.path.some(p => path.startsWith(p))
  })

  if (wildcardMatch) return wildcardMatch.requiredLevel

  // Default to ADMIN for security (secure-by-default)
  return AccessLevel.ADMIN
}

// Export route patterns for middleware matchers
export const ADMIN_ROUTES = ROUTE_ACCESS_RULES
  .filter(r => r.requiredLevel === AccessLevel.ADMIN)
  .map(r => typeof r.path === 'string' ? `${r.path}(.*)` : r.path.map(p => `${p}(.*)`))
  .flat()

export const MEMBER_PLUS_ROUTES = ROUTE_ACCESS_RULES
  .filter(r => r.requiredLevel === AccessLevel.MEMBER_PLUS)
  .map(r => typeof r.path === 'string' ? `${r.path}(.*)` : r.path.map(p => `${p}(.*)`))
  .flat()

export const MEMBER_ROUTES = ROUTE_ACCESS_RULES
  .filter(r => r.requiredLevel === AccessLevel.MEMBER)
  .map(r => typeof r.path === 'string' ? `${r.path}(.*)` : r.path.map(p => `${p}(.*)`))
  .flat()

export const PUBLIC_ROUTES = ROUTE_ACCESS_RULES
  .filter(r => r.requiredLevel === AccessLevel.EVERYONE)
  .map(r => typeof r.path === 'string' ? r.path : r.path)
  .flat()
