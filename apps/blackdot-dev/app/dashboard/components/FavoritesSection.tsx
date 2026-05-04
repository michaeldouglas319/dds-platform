'use client'

/**
 * FavoritesSection Component
 *
 * Section showing favorited routes.
 */

import React, { useMemo } from 'react'
import { useRoutesRegistry } from '@/lib/hooks/useRoutesRegistry'
import { useUserPreferences } from '@/lib/hooks/useUserPreferences'
import { RouteCard } from './RouteCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart } from 'lucide-react'

export function FavoritesSection() {
  const { routes, getRouteByPath } = useRoutesRegistry()
  const { favorites } = useUserPreferences()

  const favoriteRoutes = useMemo(() => {
    return favorites
      .map((path) => getRouteByPath(path))
      .filter((route): route is NonNullable<typeof route> => route !== undefined)
  }, [favorites, getRouteByPath])

  if (favoriteRoutes.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
          Favorites ({favoriteRoutes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteRoutes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
