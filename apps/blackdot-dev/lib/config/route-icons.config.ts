/**
 * Route Icon Mapping
 * 
 * Maps route paths to lucide-react icon names.
 * Used for dynamic icon assignment in navigation.
 */

export const ROUTE_ICON_MAP: Record<string, string> = {
  '/': 'Home',
  '/resumev3': 'FileText',
  '/ideas': 'Lightbulb',
  '/about': 'User',
  '/dashboard': 'LayoutDashboard',
  '/business': 'Briefcase',
  '/forces': 'Zap',
  '/aerosim': 'Plane',
  '/particle-simulator': 'Atom',
  '/particle-interaction': 'Sparkles',
  '/showcase': 'Grid3x3',
  '/showcase-examples': 'Layers',
  '/configurator': 'Box',
  '/premium': 'Crown',
  '/influences': 'TrendingUp',
  '/partner': 'Handshake',
  '/admin': 'Shield',
  '/chat': 'MessageCircle',
  '/blog': 'BookOpen',
  '/demos': 'FlaskConical',
  '/transitions-showcase': 'Move',
  '/loaders-showcase': 'Loader',
}

/**
 * Get icon name for a route path
 * Falls back to 'Circle' if not found
 */
export function getIconForRoutePath(path: string): string {
  return ROUTE_ICON_MAP[path] || 'Circle'
}
