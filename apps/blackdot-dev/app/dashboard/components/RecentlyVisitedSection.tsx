'use client'

/**
 * RecentlyVisitedSection Component
 *
 * Section showing recently visited routes.
 */

import React, { useMemo } from 'react'
import { useRoutesRegistry } from '@/lib/hooks/useRoutesRegistry'
import { useUserPreferences } from '@/lib/hooks/useUserPreferences'
import { RouteCard } from './RouteCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

export function RecentlyVisitedSection() {
  const { getRouteByPath } = useRoutesRegistry()
  const { recentlyVisited } = useUserPreferences()

  const recentRoutes = useMemo(() => {
    return recentlyVisited
      .map((path) => getRouteByPath(path))
      .filter((route): route is NonNullable<typeof route> => route !== undefined)
      .slice(0, 10) // Limit to 10
  }, [recentlyVisited, getRouteByPath])

  if (recentRoutes.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recently Visited ({recentRoutes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentRoutes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
