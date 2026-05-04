/**
 * Navigation Configuration - Hierarchical Structure
 *
 * This file provides a multi-tier navigation structure with:
 * - Navigation categories (Portfolio, Content, Tools, Account)
 * - Hierarchical menu items with submenus
 * - Role-based access control integration
 * - Breadcrumb support
 */

import { AccessLevel, AccessLevelType } from '@/lib/types/auth.types'

export interface NavItem {
  id: string
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  category?: 'portfolio' | 'content' | 'tools' | 'account'
  accessLevel?: AccessLevelType
  description?: string
  submenu?: NavItem[]
  breadcrumbLabel?: string
}

export interface NavCategory {
  id: string
  label: string
  description?: string
  items: NavItem[]
  accessLevel?: AccessLevelType
}

/**
 * Hierarchical Navigation Categories
 * Organizes all navigation into logical sections with role-based access
 */
export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Resume showcase and business ventures',
    items: [
      {
        id: 'resume',
        label: 'Resume',
        href: '/resumev3',
        category: 'portfolio',
        description: 'Interactive resume with 3D visualization',
        accessLevel: AccessLevel.EVERYONE,
      },
      {
        id: 'business',
        label: 'Business',
        href: '/business',
        category: 'portfolio',
        description: 'Business ventures and projects',
        accessLevel: AccessLevel.EVERYONE,
      },
      {
        id: 'ideas',
        label: 'Ideas',
        href: '/ideas',
        category: 'portfolio',
        description: 'Innovative ideas and concepts',
        accessLevel: AccessLevel.EVERYONE,
        submenu: [
          {
            id: 'ideas-general',
            label: 'General',
            href: '/ideas/general',
            description: 'General ideas',
            accessLevel: AccessLevel.EVERYONE,
          },
          {
            id: 'ideas-umbrellas',
            label: 'Expertise Umbrellas',
            href: '/ideas/umbrellav1',
            description: 'Expertise categorization',
            accessLevel: AccessLevel.EVERYONE,
          },
          {
            id: 'ideas-composites',
            label: 'Composites',
            href: '/ideas/composites',
            description: 'Composite concepts',
            accessLevel: AccessLevel.EVERYONE,
          },
        ],
      },
    ],
  },
  {
    id: 'content',
    label: 'Content & Community',
    description: 'Blog posts and conversations',
    items: [
      {
        id: 'blog',
        label: 'Blog',
        href: '/blog',
        category: 'content',
        description: 'Blog posts and articles',
        accessLevel: AccessLevel.EVERYONE,
      },
      {
        id: 'chat',
        label: 'Chat',
        href: '/chat',
        category: 'content',
        description: 'Conversations and chat',
        accessLevel: AccessLevel.MEMBER_PLUS,
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools & Simulations',
    description: 'Interactive demos and simulations',
    items: [
      {
        id: 'forces',
        label: 'Forces',
        href: '/forces',
        category: 'tools',
        description: 'Forces visualization',
        accessLevel: AccessLevel.EVERYONE,
      },
      {
        id: 'particle-sim',
        label: 'Particle Simulator',
        href: '/particle-simulator',
        category: 'tools',
        description: 'Interactive particle physics',
        accessLevel: AccessLevel.EVERYONE,
      },
      {
        id: 'aerosim',
        label: 'AeroSim',
        href: '/aerosim',
        category: 'tools',
        description: 'Aerodynamics simulator',
        accessLevel: AccessLevel.EVERYONE,
      },
      {
        id: 'loaders-showcase',
        label: 'Loaders Showcase',
        href: '/loaders-showcase',
        category: 'tools',
        description: 'Animated 3D loader components',
        accessLevel: AccessLevel.EVERYONE,
      },
    ],
  },
  {
    id: 'account',
    label: 'Account & Features',
    description: 'User account and premium features',
    accessLevel: AccessLevel.MEMBER,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        category: 'account',
        description: 'User dashboard',
        accessLevel: AccessLevel.MEMBER,
      },
      {
        id: 'premium-features',
        label: 'Premium Features',
        href: '#',
        category: 'account',
        description: 'Enhanced member features',
        accessLevel: AccessLevel.MEMBER_PLUS,
        submenu: [
          {
            id: 'influences',
            label: 'Influences',
            href: '/influences',
            description: 'Influence analysis',
            accessLevel: AccessLevel.MEMBER_PLUS,
          },
          {
            id: 'configurator',
            label: '3D Configurator',
            href: '/configurator',
            description: '3D customization',
            accessLevel: AccessLevel.MEMBER_PLUS,
          },
          {
            id: 'particle-physics',
            label: 'Particle Physics',
            href: '/particle-interaction',
            description: 'Advanced particle physics',
            accessLevel: AccessLevel.MEMBER_PLUS,
          },
          {
            id: 'premium',
            label: 'Premium Portal',
            href: '/premium',
            description: 'Premium features portal',
            accessLevel: AccessLevel.MEMBER_PLUS,
          },
        ],
      },
      {
        id: 'partner',
        label: 'Partner Area',
        href: '/partner',
        category: 'account',
        description: 'Partner portal',
        accessLevel: AccessLevel.PARTNER,
      },
      {
        id: 'admin',
        label: 'Admin Panel',
        href: '/admin',
        category: 'account',
        description: 'Administration tools',
        accessLevel: AccessLevel.ADMIN,
      },
    ],
  },
]

/**
 * Flattened navigation items for backward compatibility
 * Still used by some components
 */
export const NAVIGATION_ITEMS: NavItem[] = NAV_CATEGORIES.flatMap((cat) => cat.items)

/**
 * Helper function to check if a pathname matches a nav item
 */
export function isNavItemActive(pathname: string, navItem: NavItem): boolean {
  // Exact match
  if (pathname === navItem.href) return true

  // Check if pathname starts with nav item href (for nested routes)
  if (pathname.startsWith(navItem.href + '/')) return true

  // Check submenu items
  if (navItem.submenu) {
    return navItem.submenu.some((item) => isNavItemActive(pathname, item))
  }

  return false
}

/**
 * Get all flat navigation items (useful for breadcrumbs, maps, etc.)
 */
export function getFlattenedNavItems(): NavItem[] {
  const flattened: NavItem[] = []

  function flatten(items: NavItem[]) {
    items.forEach((item) => {
      flattened.push(item)
      if (item.submenu) {
        flatten(item.submenu)
      }
    })
  }

  flatten(NAVIGATION_ITEMS)
  return flattened
}

/**
 * Get navigation item by href
 */
export function getNavItemByHref(href: string): NavItem | undefined {
  return getFlattenedNavItems().find((item) => item.href === href)
}

/**
 * Get navigation item label by href
 */
export function getNavItemLabel(href: string): string {
  const item = getNavItemByHref(href)
  return item?.label || ''
}

/**
 * Get breadcrumb path for a given href
 * Returns array of { label, href } for breadcrumb navigation
 */
export function getBreadcrumbPath(href: string): Array<{ label: string; href: string }> {
  const breadcrumbs: Array<{ label: string; href: string }> = [
    { label: 'Home', href: '/' },
  ]

  // Find the navigation item and build path
  for (const category of NAV_CATEGORIES) {
    for (const item of category.items) {
      if (item.href === href) {
        // Direct match
        breadcrumbs.push({ label: category.label, href: '#' })
        breadcrumbs.push({ label: item.label, href: item.href })
        return breadcrumbs
      }

      // Check submenu
      if (item.submenu) {
        for (const subitem of item.submenu) {
          if (subitem.href === href) {
            breadcrumbs.push({ label: category.label, href: '#' })
            breadcrumbs.push({ label: item.label, href: item.href })
            breadcrumbs.push({ label: subitem.label, href: subitem.href })
            return breadcrumbs
          }
        }
      }
    }
  }

  // Fallback for exact matches
  if (href === '/') {
    return [{ label: 'Home', href: '/' }]
  }

  return breadcrumbs
}

/**
 * Filter navigation categories by access level
 */
export function filterNavCategoriesByAccess(
  accessLevel: AccessLevelType = AccessLevel.EVERYONE,
): NavCategory[] {
  const levelMap = { everyone: 0, member: 1, member_plus: 2, partner: 3, admin: 4 } as const

  return NAV_CATEGORIES.map((category) => {
    // Check if category requires higher access
    const categoryWeight = category.accessLevel ? levelMap[category.accessLevel] : 0
    const userWeight = levelMap[accessLevel]

    if (userWeight < categoryWeight) {
      return null
    }

    // Filter items within category
    const filteredItems = category.items.filter((item) => {
      const itemWeight = item.accessLevel ? levelMap[item.accessLevel] : 0
      return userWeight >= itemWeight
    })

    // Filter submenu items
    const itemsWithFilteredSubmenu = filteredItems.map((item) => {
      if (item.submenu) {
        return {
          ...item,
          submenu: item.submenu.filter((subitem) => {
            const subitemWeight = subitem.accessLevel ? levelMap[subitem.accessLevel] : 0
            return userWeight >= subitemWeight
          }),
        }
      }
      return item
    })

    return {
      ...category,
      items: itemsWithFilteredSubmenu,
    }
  }).filter(Boolean) as NavCategory[]
}
