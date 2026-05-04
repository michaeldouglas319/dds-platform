'use client'

/**
 * useRouteTracking Hook
 * 
 * Tracks route visits for the recently visited feature.
 * Automatically tracks when pathname changes.
 */

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useUserPreferences } from './useUserPreferences'

/**
 * Hook to automatically track route visits
 */
export function useRouteTracking(): void {
  const pathname = usePathname()
  const { trackVisit } = useUserPreferences()

  useEffect(() => {
    if (pathname && pathname !== '/') {
      // Don't track home page
      trackVisit(pathname)
    }
  }, [pathname, trackVisit])
}

/**
 * RouteTracker Component
 * 
 * Component to add to layout for automatic route tracking
 */
export function RouteTracker(): null {
  useRouteTracking()
  return null
}
