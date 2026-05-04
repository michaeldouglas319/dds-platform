'use client'

/**
 * useRoutesRegistry - Client-side hook for accessing routes
 *
 * Loads the auto-generated routes registry from /public/registry/routes.json
 * Provides typed access to all routes with caching
 * Automatically filters out blocked routes based on context
 *
 * Usage:
 * const { routes, publicRoutes, memberPlusRoutes } = useRoutesRegistry()
 * const route = routes.find(r => r.path === '/admin')
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { filterBlockedRoutes } from '@/lib/config/route-blocklist.config'

export interface RouteMetadata {
  id: string
  path: string
  label: string
  accessLevel: 'EVERYONE' | 'MEMBER' | 'MEMBER_PLUS' | 'PARTNER' | 'ADMIN'
  accessLevelValue: number
  description?: string
  category?: string
  isPublic: boolean
  featured?: boolean
  icon?: string
  tags?: string[]
  order?: number
  hidden?: boolean
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

interface UseRoutesRegistryReturn {
  routes: RouteMetadata[]
  registry: RoutesRegistry | null
  loading: boolean
  error: Error | null
  publicRoutes: RouteMetadata[]
  memberPlusRoutes: RouteMetadata[]
  partnerRoutes: RouteMetadata[]
  adminRoutes: RouteMetadata[]
  getRouteByPath: (path: string) => RouteMetadata | undefined
  getRouteById: (id: string) => RouteMetadata | undefined
}

// Client-side cache
let cachedRegistry: RoutesRegistry | null = null
let registryPromise: Promise<RoutesRegistry> | null = null

async function fetchRegistry(): Promise<RoutesRegistry> {
  // Return cached version if available
  if (cachedRegistry) {
    return cachedRegistry
  }

  // Return pending promise if already loading
  if (registryPromise) {
    return registryPromise
  }

  // Fetch registry
  registryPromise = (async () => {
    try {
      const response = await fetch('/registry/routes.json')
      if (!response.ok) {
        throw new Error(`Failed to load routes registry: ${response.statusText}`)
      }
      const data = await response.json()
      cachedRegistry = data
      return data
    } catch (error) {
      cachedRegistry = null
      registryPromise = null
      throw error
    }
  })()

  return registryPromise
}

/**
 * Hook to access routes registry on client
 */
export function useRoutesRegistry(): UseRoutesRegistryReturn {
  const [registry, setRegistry] = useState<RoutesRegistry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadRegistry = async () => {
      try {
        const data = await fetchRegistry()
        setRegistry(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setRegistry(null)
      } finally {
        setLoading(false)
      }
    }

    loadRegistry()
  }, [])

  // Filter out blocked routes and hidden routes
  const routes = useMemo(() => {
    if (!registry) return []
    const allRoutes = Object.values(registry.byId)
      .filter((r) => !r.hidden) // Filter hidden routes
      .sort((a, b) => a.path.localeCompare(b.path))
    // Filter blocked routes from dashboard/navigation/search
    return filterBlockedRoutes(allRoutes, 'dashboard')
  }, [registry])

  const getRouteByPath = useCallback(
    (path: string) => {
      return registry ? Object.values(registry.byId).find((r) => r.path === path) : undefined
    },
    [registry]
  )

  const getRouteById = useCallback(
    (id: string) => {
      return registry ? registry.byId[id] : undefined
    },
    [registry]
  )

  // Filter blocked routes from each access level
  const publicRoutes = useMemo(() => {
    const routes = registry?.byAccessLevel.EVERYONE || []
    return filterBlockedRoutes(routes, 'dashboard')
  }, [registry])

  const memberPlusRoutes = useMemo(() => {
    const routes = registry?.byAccessLevel.MEMBER_PLUS || []
    return filterBlockedRoutes(routes, 'dashboard')
  }, [registry])

  const partnerRoutes = useMemo(() => {
    const routes = registry?.byAccessLevel.PARTNER || []
    return filterBlockedRoutes(routes, 'dashboard')
  }, [registry])

  const adminRoutes = useMemo(() => {
    const routes = registry?.byAccessLevel.ADMIN || []
    return filterBlockedRoutes(routes, 'dashboard')
  }, [registry])

  return {
    routes,
    registry,
    loading,
    error,
    publicRoutes,
    memberPlusRoutes,
    partnerRoutes,
    adminRoutes,
    getRouteByPath,
    getRouteById,
  }
}
