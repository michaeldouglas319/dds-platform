'use client'

/**
 * RouteCard Component
 *
 * Individual route card with favorite button, access level badge, and navigation.
 */

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserPreferences } from '@/lib/hooks/useUserPreferences'
import type { RouteMetadata } from '@/lib/hooks/useRoutesRegistry'
import { getIconForRoute } from '@/lib/utils/route-icons'

export interface RouteCardProps {
  route: RouteMetadata
  className?: string
}

export function RouteCard({ route, className }: RouteCardProps) {
  const router = useRouter()
  const { isFavorite, toggleFavorite } = useUserPreferences()
  const Icon = getIconForRoute(route.path)

  const favorite = isFavorite(route.path)

  const handleClick = () => {
    router.push(route.path)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(route.path)
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'ADMIN':
        return 'bg-red-600'
      case 'PARTNER':
        return 'bg-purple-600'
      case 'MEMBER_PLUS':
        return 'bg-blue-600'
      case 'MEMBER':
        return 'bg-green-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg hover:scale-105',
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h3 className="font-semibold text-sm truncate">{route.label}</h3>
            </div>
            {route.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {route.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={cn('text-xs', getAccessLevelColor(route.accessLevel))}
              >
                {route.accessLevel}
              </Badge>
              {route.category && (
                <Badge variant="outline" className="text-xs">
                  {route.category}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleFavoriteClick}
              title={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={cn(
                  'h-4 w-4',
                  favorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                )}
              />
            </Button>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
