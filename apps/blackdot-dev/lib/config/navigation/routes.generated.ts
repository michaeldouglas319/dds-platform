/**
 * Generated Routes Configuration - SERVER-SIDE ONLY
 *
 * ⚠️  This file uses Node.js 'fs' module - ONLY use in server components!
 *
 * For client-side access, use: lib/hooks/useRoutesRegistry.ts
 *
 * SINGLE SOURCE OF TRUTH: /public/registry/routes.json
 *
 * This file is auto-generated from route discovery.
 * Do NOT manually edit this file.
 *
 * Run: npm run generate-routes-registry
 * Auto-runs: npm run build
 *
 * All routes are discovered from /app directory by analyzing:
 * - Route file structure
 * - Access level guards (requireAdmin(), requireMemberPlus(), etc.)
 * - Manual route overrides (for routes without auto-detection)
 */

// ⚠️  IMPORTANT: This file can ONLY be used in server components!
// It uses Node.js 'fs' module which doesn't work in browsers.

// Avoid importing at module level - use dynamic import in server components
// Or use the client hook: useRoutesRegistry()

// Export types (safe for both client and server)
export interface RouteMetadata {
  id: string
  path: string
  label: string
  accessLevel: 'EVERYONE' | 'MEMBER' | 'MEMBER_PLUS' | 'PARTNER' | 'ADMIN'
  accessLevelValue: number
  description?: string
  category?: string
  isPublic: boolean
}

export interface RoutesRegistry {
  version: string
  generatedAt: string
  totalRoutes: number
  byAccessLevel: Record<string, RouteMetadata[]>
  byId: Record<string, RouteMetadata>
  stats: {
    countByAccessLevel: Record<string, number>
  }
}

/**
 * LAZY LOAD - Only loads registry when actually used in server context
 * This avoids 'fs' import errors in client builds
 */
let cachedRegistry: RoutesRegistry | null = null

function loadRegistry(): RoutesRegistry {
  // Dynamic import to avoid fs errors in client builds
  const { readFileSync } = require('fs')
  const path = require('path')

  try {
    const registryPath = path.join(process.cwd(), 'public', 'registry', 'routes.json')
    const registryData = readFileSync(registryPath, 'utf-8')
    return JSON.parse(registryData)
  } catch (error) {
    console.error('Failed to load routes registry:', error)
    // Return empty registry as fallback
    return {
      version: '0.0.0',
      generatedAt: new Date().toISOString(),
      totalRoutes: 0,
      byAccessLevel: {
        EVERYONE: [],
        MEMBER: [],
        MEMBER_PLUS: [],
        PARTNER: [],
        ADMIN: [],
      },
      byId: {},
      stats: {
        countByAccessLevel: {
          EVERYONE: 0,
          MEMBER: 0,
          MEMBER_PLUS: 0,
          PARTNER: 0,
          ADMIN: 0,
        },
      },
    }
  }
}

function getRegistry(): RoutesRegistry {
  if (!cachedRegistry) {
    cachedRegistry = loadRegistry()
  }
  return cachedRegistry
}

/**
 * Get all routes
 */
export function getAllRoutes(): RouteMetadata[] {
  const registry = getRegistry()
  return Object.values(registry.byId).sort((a, b) => a.path.localeCompare(b.path))
}

/**
 * Get route by path
 */
export function getRouteByPath(routePath: string): RouteMetadata | undefined {
  const registry = getRegistry()
  return Object.values(registry.byId).find((route) => route.path === routePath)
}

/**
 * Get route by ID
 */
export function getRouteById(id: string): RouteMetadata | undefined {
  const registry = getRegistry()
  return registry.byId[id]
}

/**
 * Get routes by access level
 */
export function getRoutesByAccessLevel(
  accessLevel: 'EVERYONE' | 'MEMBER' | 'MEMBER_PLUS' | 'PARTNER' | 'ADMIN'
): RouteMetadata[] {
  const registry = getRegistry()
  return registry.byAccessLevel[accessLevel] || []
}

/**
 * Get public routes (EVERYONE)
 */
export function getPublicRoutes(): RouteMetadata[] {
  return getRoutesByAccessLevel('EVERYONE')
}

/**
 * Get Member+ routes
 */
export function getMemberPlusRoutes(): RouteMetadata[] {
  return getRoutesByAccessLevel('MEMBER_PLUS')
}

/**
 * Get Partner routes
 */
export function getPartnerRoutes(): RouteMetadata[] {
  return getRoutesByAccessLevel('PARTNER')
}

/**
 * Get Admin routes
 */
export function getAdminRoutes(): RouteMetadata[] {
  return getRoutesByAccessLevel('ADMIN')
}

/**
 * Get organized routes for dashboard display
 */
export function getDashboardRoutes() {
  return {
    public: getPublicRoutes(),
    memberPlus: getMemberPlusRoutes(),
    partner: getPartnerRoutes(),
    admin: getAdminRoutes(),
  }
}

/**
 * Get navigation items from routes
 * Transforms registry into navigation-friendly format
 */
export function getNavigationRoutes(): Array<{
  label: string
  href: string
  description?: string
  accessLevel?: number
  category?: string
}> {
  return getAllRoutes().map((route) => ({
    label: route.label,
    href: route.path,
    description: route.description,
    accessLevel: route.accessLevelValue,
    category: route.category,
  }))
}

/**
 * Get route with extended metadata
 * Includes SEO, icons, colors, and custom data
 */
export function getRouteWithMetadata(path: string) {
  const route = getRouteByPath(path)
  if (!route) return null

  // Import here to avoid circular dependency
  const { getRouteMetadata } = require('./route-metadata')
  const metadata = getRouteMetadata(path)

  return {
    ...route,
    ...metadata,
  }
}

/**
 * Check if route requires authentication
 */
export function routeRequiresAuth(routePath: string): boolean {
  const route = getRouteByPath(routePath)
  return route ? route.accessLevel !== 'EVERYONE' : false
}

/**
 * Get registry metadata
 */
export function getRegistryMetadata() {
  const registry = getRegistry()
  return {
    version: registry.version,
    generatedAt: registry.generatedAt,
    totalRoutes: registry.totalRoutes,
    stats: registry.stats,
  }
}

/**
 * Get full registry (for debugging/admin)
 */
export function getFullRegistry(): RoutesRegistry {
  return getRegistry()
}
