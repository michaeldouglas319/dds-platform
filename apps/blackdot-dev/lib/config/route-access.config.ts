/**
 * Route Access Configuration
 * 
 * SINGLE SOURCE OF TRUTH for all route access levels.
 * All route access control is defined here - no other locations should define access.
 * 
 * Access Levels:
 * - EVERYONE: Public access (no authentication required)
 * - MEMBER: Requires sign-up/authentication
 * - MEMBER_PLUS: Requires premium membership
 * - PARTNER: Requires partner access
 * - ADMIN: Requires admin access
 * 
 * Default Behavior:
 * - Only /, /login, and /unauthorized are public (EVERYONE)
 * - All other routes require authentication (MEMBER or higher)
 * - All dynamic routes and unspecified paths default to ADMIN (admin-only)
 * - Secure-by-default: unconfigured routes require admin access
 */

import type { AccessLevelType } from '@/lib/types/auth.types'

export interface RouteAccessConfig {
  path: string
  accessLevel: 'EVERYONE' | 'MEMBER' | 'MEMBER_PLUS' | 'PARTNER' | 'ADMIN'
  label?: string
  description?: string
  category?: string
  featured?: boolean
  icon?: string
  order?: number
  tags?: string[]
  hidden?: boolean
}

/**
 * Centralized route access configuration
 * This is the ONLY place where route access levels should be defined
 */
export const ROUTE_ACCESS_CONFIG: Record<string, RouteAccessConfig> = {
  // Public routes (no authentication required)
  '/': {
    path: '/',
    accessLevel: 'EVERYONE',
    label: 'Home',
    description: 'Landing page and main entry point',
    category: 'main',
    featured: true,
    icon: 'Home',
    order: 1,
  },
  '/login': {
    path: '/login',
    accessLevel: 'EVERYONE',
    label: 'Login',
    description: 'User authentication',
    category: 'main',
    hidden: true, // Hidden from navigation
  },
  '/unauthorized': {
    path: '/unauthorized',
    accessLevel: 'EVERYONE',
    label: 'Access Denied',
    description: 'Unauthorized access page',
    category: 'public',
    hidden: true, // Error page - hidden from navigation
  },
  '/portfolio': {
    path: '/portfolio',
    accessLevel: 'EVERYONE',
    label: 'Portfolio',
    description: 'Sunny Patel - Full-stack developer portfolio',
    category: 'portfolio',
    featured: true,
    icon: 'Briefcase',
    order: 4,
  },
  '/sections-showcase': {
    path: '/sections-showcase',
    accessLevel: 'EVERYONE',
    label: 'Sections Showcase',
    description: 'Interchangeable sections with particle morphing transitions',
    category: 'portfolio',
    featured: true,
    icon: 'Layers',
    order: 5,
  },

  // All routes require authentication (MEMBER) except /, /login, and /unauthorized
  '/resumev3': {
    path: '/resumev3',
    accessLevel: 'MEMBER',
    label: 'Resume',
    description: 'Interactive resume with 3D visualization',
    category: 'portfolio',
    featured: true,
    icon: 'FileText',
    order: 2,
  },
  '/prediction': {
    path: '/prediction',
    accessLevel: 'MEMBER',
    label: 'Prediction',
    description: 'Personalized prediction and insights',
    category: 'portfolio',
    featured: true,
    icon: 'TrendingUp',
    order: 3,
  },
  '/business': {
    path: '/business',
    accessLevel: 'MEMBER',
    label: 'Business',
    description: 'Business information and portfolio',
    category: 'portfolio',
  },
  '/ideas': {
    path: '/ideas',
    accessLevel: 'MEMBER_PLUS',
    label: 'Ideas',
    description: 'Innovative ideas and projects (Member+ and above)',
    category: 'member_plus',
    featured: true,
    icon: 'Lightbulb',
    order: 3,
  },
  '/about': {
    path: '/about',
    accessLevel: 'MEMBER',
    label: 'About',
    description: 'About information',
    category: 'main',
    featured: true,
    icon: 'User',
    order: 4,
  },
  '/dashboard': {
    path: '/dashboard',
    accessLevel: 'MEMBER',
    label: 'Dashboard',
    description: 'User dashboard with role-based navigation',
    category: 'public',
  },
  '/forces': {
    path: '/forces',
    accessLevel: 'MEMBER',
    label: 'Forces',
    description: 'Forces visualization and simulation',
    category: 'public',
  },
  '/aerosim': {
    path: '/aerosim',
    accessLevel: 'MEMBER',
    label: 'AeroSim',
    description: 'Aerodynamics simulator',
    category: 'public',
  },
  '/particle-simulator': {
    path: '/particle-simulator',
    accessLevel: 'MEMBER',
    label: 'Particle Simulator',
    description: 'Interactive particle physics simulator',
    category: 'public',
  },
  '/showcase': {
    path: '/showcase',
    accessLevel: 'MEMBER',
    label: 'Showcase',
    description: 'Component showcase and catalog',
    category: 'public',
  },
  '/premium': {
    path: '/premium',
    accessLevel: 'MEMBER_PLUS',
    label: 'Premium',
    description: 'Premium features',
    category: 'member_plus',
  },
  '/influences': {
    path: '/influences',
    accessLevel: 'MEMBER_PLUS',
    label: 'Influences',
    description: 'Influence analysis and tracking',
    category: 'member_plus',
  },
  '/configurator': {
    path: '/configurator',
    accessLevel: 'MEMBER_PLUS',
    label: '3D Configurator',
    description: '3D object configurator and customizer',
    category: 'member_plus',
  },
  '/particle-interaction': {
    path: '/particle-interaction',
    accessLevel: 'MEMBER_PLUS',
    label: 'Particle Physics',
    description: 'Advanced particle interaction physics',
    category: 'member_plus',
  },
  '/partner': {
    path: '/partner',
    accessLevel: 'PARTNER',
    label: 'Partner Area',
    description: 'Partner portal and resources',
    category: 'partner',
  },
  '/admin': {
    path: '/admin',
    accessLevel: 'ADMIN',
    label: 'Admin Panel',
    description: 'Administration tools and controls',
    category: 'admin',
  },
  '/chat': {
    path: '/chat',
    accessLevel: 'MEMBER_PLUS',
    label: 'Chat',
    description: 'Chat interface',
    category: 'public',
  },
  '/showcase-examples': {
    path: '/showcase-examples',
    accessLevel: 'MEMBER',
    label: 'Showcase Examples',
    description: 'Showcase example components',
    category: 'public',
  },
  '/transitions-showcase': {
    path: '/transitions-showcase',
    accessLevel: 'ADMIN',
    label: 'Transitions Showcase',
    description: 'Transition effects showcase',
    category: 'demos',
  },
  '/loaders-showcase': {
    path: '/loaders-showcase',
    accessLevel: 'ADMIN',
    label: 'Loaders Showcase',
    description: 'Loading animations showcase',
    category: 'demos',
  },
  '/advanced-functions': {
    path: '/advanced-functions',
    accessLevel: 'ADMIN',
    label: 'Advanced Functions',
    description: 'Advanced function demonstrations',
    category: 'demos',
  },
  '/selection-showcase': {
    path: '/selection-showcase',
    accessLevel: 'ADMIN',
    label: 'Selection Showcase',
    description: 'Interactive 3D model morphing showcase with detail controls',
    category: 'demos',
  },
  '/resume-parallax': {
    path: '/resume-parallax',
    accessLevel: 'MEMBER',
    label: 'Resume Parallax',
    description: 'Parallax resume visualization',
    category: 'portfolio',
  },
  '/test-camera': {
    path: '/test-camera',
    accessLevel: 'MEMBER',
    label: 'Test Camera',
    description: 'Camera viewfinder test suite',
    category: 'demos',
    hidden: true, // Test page - hidden from navigation
  },
  '/tier1-demo': {
    path: '/tier1-demo',
    accessLevel: 'MEMBER',
    label: 'Tier1 Demo',
    description: 'Tier 1 demonstration',
    category: 'demos',
  },
}

/**
 * Valid access levels
 */
const VALID_ACCESS_LEVELS = ['EVERYONE', 'MEMBER', 'MEMBER_PLUS', 'PARTNER', 'ADMIN'] as const

/**
 * Get access level for a route
 * Returns the configured access level or defaults to ADMIN (secure-by-default)
 * 
 * Rules:
 * - Routes explicitly configured in ROUTE_ACCESS_CONFIG use their configured access level (if valid)
 * - Invalid access levels in config default to ADMIN
 * - All unconfigured routes (dynamic paths, unspecified routes) default to ADMIN (admin-only)
 * - No file-based detection - only centralized config is used
 * 
 * @param routePath - The route path (e.g., '/resumev3')
 * @returns The access level for the route
 */
export function getRouteAccessLevel(routePath: string): 'EVERYONE' | 'MEMBER' | 'MEMBER_PLUS' | 'PARTNER' | 'ADMIN' {
  const config = ROUTE_ACCESS_CONFIG[routePath]
  
  // If route is configured, validate and use its access level
  if (config && config.accessLevel) {
    // Validate access level is one of the valid options
    if (VALID_ACCESS_LEVELS.includes(config.accessLevel as any)) {
      return config.accessLevel
    }
    // If invalid access level, default to ADMIN
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Invalid access level "${config.accessLevel}" for route "${routePath}", defaulting to ADMIN`)
    }
    return 'ADMIN'
  }

  // Default: all unconfigured routes are ADMIN-only (secure-by-default)
  // This includes:
  // - Dynamic routes like /ideas/[sectionId], /business/[sectionId]
  // - Routes not in ROUTE_ACCESS_CONFIG
  // - Any unspecified paths
  return 'ADMIN'
}

/**
 * Get full route access configuration
 * 
 * @param routePath - The route path
 * @returns The full access configuration or null if not found
 */
export function getRouteAccessConfig(routePath: string): RouteAccessConfig | null {
  return ROUTE_ACCESS_CONFIG[routePath] || null
}

/**
 * Get all routes for a specific access level
 * 
 * @param accessLevel - The access level to filter by
 * @returns Array of route configurations
 */
export function getRoutesByAccessLevel(
  accessLevel: 'EVERYONE' | 'MEMBER' | 'MEMBER_PLUS' | 'PARTNER' | 'ADMIN'
): RouteAccessConfig[] {
  return Object.values(ROUTE_ACCESS_CONFIG).filter((config) => config.accessLevel === accessLevel)
}

/**
 * Check if a route requires authentication
 * 
 * @param routePath - The route path
 * @returns True if the route requires authentication (not EVERYONE)
 */
export function requiresAuthentication(routePath: string): boolean {
  return getRouteAccessLevel(routePath) !== 'EVERYONE'
}

/**
 * Get default access level for routes not explicitly configured
 * 
 * Dynamic routes and unspecified paths default to ADMIN (admin-only).
 * Only routes explicitly configured in ROUTE_ACCESS_CONFIG are public.
 * 
 * @returns The default access level (ADMIN - secure-by-default)
 */
export function getDefaultAccessLevel(): 'ADMIN' {
  return 'ADMIN' // Secure-by-default - unconfigured routes are admin-only
}
