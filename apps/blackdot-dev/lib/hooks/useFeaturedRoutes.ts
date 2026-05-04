'use client'

/**
 * useFeaturedRoutes Hook
 * 
 * Filters and enriches routes for AccentSection navigation.
 * Only returns routes marked as featured.
 */

import { useMemo } from 'react'
import { useRoutesRegistry, type RouteMetadata } from './useRoutesRegistry'
import { FEATURED_ROUTES } from '@/lib/config/featured-routes.config'
import { getIconNameForRoute } from '@/lib/utils/route-icons'

export interface FeaturedRoute extends RouteMetadata {
  icon: string
  order: number
}

export interface UseFeaturedRoutesReturn {
  featuredRoutes: FeaturedRoute[]
  loading: boolean
}

/**
 * Hook to get featured routes for AccentSection
 */
export function useFeaturedRoutes(): UseFeaturedRoutesReturn {
  const { routes, loading } = useRoutesRegistry()

  const featuredRoutes = useMemo(() => {
    if (!routes) return []

    // Get featured routes from config
    const featuredPaths = new Set(FEATURED_ROUTES.map((fr) => fr.path))
    
    // Filter routes that are featured
    const featured = routes
      .filter((route) => {
        // Check if route is marked as featured in registry
        if (route.featured) return true
        // Check if route is in featured config
        return featuredPaths.has(route.path)
      })
      .map((route) => {
        // Find matching featured config
        const featuredConfig = FEATURED_ROUTES.find((fr) => fr.path === route.path)
        
        return {
          ...route,
          icon: route.icon || featuredConfig?.icon || getIconNameForRoute(route.path),
          order: route.order || featuredConfig?.order || 999,
        } as FeaturedRoute
      })
      .sort((a, b) => a.order - b.order)

    return featured
  }, [routes])

  return {
    featuredRoutes,
    loading,
  }
}
