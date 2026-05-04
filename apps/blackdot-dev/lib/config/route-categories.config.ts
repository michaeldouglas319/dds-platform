/**
 * Route Categories Configuration
 * 
 * Defines categories for grouping routes in the dashboard.
 */

export interface RouteCategory {
  id: string
  label: string
  description?: string
  icon?: string
  color?: string
}

export const ROUTE_CATEGORIES: RouteCategory[] = [
  {
    id: 'main',
    label: 'Main',
    description: 'Primary navigation pages',
    icon: 'Home',
    color: 'primary',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Portfolio and showcase pages',
    icon: 'Briefcase',
    color: 'blue',
  },
  {
    id: 'demos',
    label: 'Demos',
    description: 'Interactive demonstrations',
    icon: 'FlaskConical',
    color: 'purple',
  },
  {
    id: 'tools',
    label: 'Tools',
    description: 'Utility and tool pages',
    icon: 'Wrench',
    color: 'orange',
  },
  {
    id: 'simulations',
    label: 'Simulations',
    description: 'Physics and simulation demos',
    icon: 'Atom',
    color: 'green',
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Administrative tools',
    icon: 'Shield',
    color: 'red',
  },
]

/**
 * Get category by ID
 */
export function getCategoryById(id: string): RouteCategory | undefined {
  return ROUTE_CATEGORIES.find((cat) => cat.id === id)
}

/**
 * Get default category for a route based on path patterns
 */
export function getDefaultCategoryForPath(path: string): string {
  if (path === '/' || path === '/about' || path === '/dashboard') {
    return 'main'
  }
  if (path.includes('showcase') || path.includes('demo')) {
    return 'demos'
  }
  if (path.includes('simulator') || path.includes('simulation') || path.includes('aerosim') || path.includes('particle')) {
    return 'simulations'
  }
  if (path.includes('business') || path.includes('resume') || path.includes('ideas')) {
    return 'portfolio'
  }
  if (path === '/admin' || path.includes('admin')) {
    return 'admin'
  }
  return 'tools'
}
