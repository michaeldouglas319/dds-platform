/**
 * Featured Routes Configuration
 * 
 * Centralized configuration for routes that appear in AccentSection navigation.
 * Only routes listed here will be shown in the sidebar navigation.
 */

export interface FeaturedRouteConfig {
  path: string
  icon: string // lucide-react icon name
  order: number
  label?: string // Override label (optional)
}

export const FEATURED_ROUTES: FeaturedRouteConfig[] = [
  { path: '/', icon: 'Home', order: 1 },
  { path: '/resumev3', icon: 'FileText', order: 2 },
  { path: '/ideas', icon: 'Lightbulb', order: 3 },
  { path: '/about', icon: 'User', order: 4 },
]
