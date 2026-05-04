/**
 * Route Metadata Configuration
 *
 * Extended metadata for routes beyond basic access control.
 * This is the single source of truth for all route-specific configuration.
 *
 * USAGE:
 * import { getRouteMetadata } from '@/lib/config/route-metadata'
 *
 * const meta = getRouteMetadata('/homepage')
 * console.log(meta.seo.title, meta.icon, meta.customData)
 */

export interface RouteMetadataExtended {
  // Core route info (from registry)
  path: string
  label: string
  description?: string
  accessLevel: string
  category: string

  // SEO & Display
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
    ogImage?: string
  }

  // UI Customization
  icon?: string
  color?: string
  badge?: string

  // Route-specific features
  features?: {
    [key: string]: boolean | string | number
  }

  // Custom data for special routes
  customData?: Record<string, unknown>
}

/**
 * Extended metadata overrides for specific routes
 * These extend the base route data from the registry
 */
export const ROUTE_METADATA_OVERRIDES: Record<string, Partial<RouteMetadataExtended>> = {
  // Homepage - Special configuration
  '/': {
    seo: {
      title: 'Michael Douglas | Software Engineer & Innovator',
      description: 'Explore cutting-edge software engineering, 3D visualization, and interactive experiences',
      keywords: [
        'software engineer',
        'full-stack developer',
        'react',
        'three.js',
        '3d visualization',
        'web development',
      ],
      ogImage: '/assets/og-home.png',
    },
    icon: '🏠',
    color: '#6366f1', // Indigo
    customData: {
      showHero: true,
      showParticles: true,
      highlightedProjects: ['physics-character-controller', 'particle-interaction'],
    },
  },

  // Resume
  '/resumev3': {
    seo: {
      title: 'Resume | Michael Douglas',
      description: 'Interactive resume with 3D visualization and project portfolio',
      keywords: ['resume', 'portfolio', 'projects', 'experience', 'skills'],
    },
    icon: '📄',
    color: '#3b82f6', // Blue
  },

  // Business
  '/business': {
    seo: {
      title: 'Business | Michael Douglas',
      description: 'Business ventures and entrepreneurial projects',
      keywords: ['business', 'ventures', 'entrepreneurship'],
    },
    icon: '💼',
    color: '#06b6d4', // Cyan
  },

  // Ideas
  '/ideas': {
    seo: {
      title: 'Ideas | Michael Douglas',
      description: 'Innovative ideas and creative projects',
      keywords: ['ideas', 'innovation', 'creativity', 'projects'],
    },
    icon: '💡',
    color: '#f59e0b', // Amber
  },

  // Premium/Member+ routes
  '/premium': {
    icon: '⭐',
    color: '#ec4899', // Pink
    badge: 'Member+',
  },

  '/influences': {
    icon: '🌟',
    color: '#8b5cf6', // Violet
    badge: 'Member+',
  },

  '/configurator': {
    icon: '🎨',
    color: '#06b6d4', // Cyan
    badge: 'Member+',
  },

  '/particle-interaction': {
    icon: '✨',
    color: '#ec4899', // Pink
    badge: 'Member+',
  },

  // Partner routes
  '/partner': {
    icon: '🤝',
    color: '#f97316', // Orange
    badge: 'Partner',
  },

  // Admin routes
  '/admin': {
    icon: '⚙️',
    color: '#ef4444', // Red
    badge: 'Admin',
  },
}

/**
 * Get extended metadata for a route
 */
export function getRouteMetadata(path: string): RouteMetadataExtended | null {
  return ROUTE_METADATA_OVERRIDES[path] as RouteMetadataExtended | null
}

/**
 * Get SEO metadata for a route
 */
export function getRouteSEO(path: string) {
  return ROUTE_METADATA_OVERRIDES[path]?.seo
}

/**
 * Get icon for a route
 */
export function getRouteIcon(path: string): string | undefined {
  return ROUTE_METADATA_OVERRIDES[path]?.icon
}

/**
 * Get color for a route
 */
export function getRouteColor(path: string): string | undefined {
  return ROUTE_METADATA_OVERRIDES[path]?.color
}

/**
 * Get badge for a route
 */
export function getRouteBadge(path: string): string | undefined {
  return ROUTE_METADATA_OVERRIDES[path]?.badge
}

/**
 * Get custom data for a route
 */
export function getRouteCustomData(path: string): Record<string, unknown> | undefined {
  return ROUTE_METADATA_OVERRIDES[path]?.customData
}

/**
 * Check if route has a feature enabled
 */
export function isRouteFeatureEnabled(path: string, feature: string): boolean | undefined {
  const features = ROUTE_METADATA_OVERRIDES[path]?.features
  return features?.[feature] as boolean | undefined
}
