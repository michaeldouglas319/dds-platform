/**
 * Navigation Configuration Barrel Export
 *
 * Centralized import path for all navigation-related configurations:
 * - Navigation structure and menus
 * - Route metadata and hierarchies
 *
 * ⚠️  IMPORTANT: Server-side route functions use Node.js 'fs' module
 * Safe for client components - only types exported from routes.generated
 * Server-side functions available via direct import:
 *   import { getDashboardRoutes } from '@/lib/config/navigation/routes.generated'
 */

export * from './navigation.config'
// Only export TYPES from routes.generated to avoid 'fs' errors in client builds
export type { RouteMetadata, RoutesRegistry } from './routes.generated'
export * from './route-metadata'
