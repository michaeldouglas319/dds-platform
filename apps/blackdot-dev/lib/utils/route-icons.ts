/**
 * Route Icons Utility
 * 
 * Dynamically imports and returns lucide-react icons for routes.
 */

import * as Icons from 'lucide-react'
import { ROUTE_ICON_MAP } from '@/lib/config/route-icons.config'

import type { LucideIcon } from 'lucide-react'

/**
 * Get icon component for a route path
 * 
 * @param path - Route path (e.g., '/dashboard')
 * @returns React component for the icon, or Circle as fallback
 */
export function getIconForRoute(path: string): LucideIcon {
  const iconName = ROUTE_ICON_MAP[path] || 'Circle'
  
  // Type assertion needed because lucide-react exports are dynamic
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[iconName]
  
  return IconComponent || Icons.Circle
}

/**
 * Get icon name for a route path
 */
export function getIconNameForRoute(path: string): string {
  return ROUTE_ICON_MAP[path] || 'Circle'
}
