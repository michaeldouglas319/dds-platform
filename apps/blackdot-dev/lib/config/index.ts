/**
 * Configuration Module - Single Source of Truth
 *
 * Unified import paths for all application configurations organized by domain:
 * - Design System: design tokens, view presets, card layouts
 * - Navigation: routes, navigation items, route metadata
 * - Content: page content, sections data
 * - Models: 3D model configurations
 * - Annotations: 3D scene annotations
 * - Particles: Particle system configurations
 * - Expertise: Domain expertise data
 * - Verticals: Business vertical data
 *
 * @example
 * ```typescript
 * // Design configs
 * import { VIEW_PRESETS } from '@/lib/config/design'
 * import { SPACING_TOKENS } from '@/lib/config/design'
 *
 * // Navigation configs
 * import { NAVIGATION_ITEMS } from '@/lib/config/navigation'
 * import { getRouteMetadata } from '@/lib/config/navigation'
 *
 * // Content configs
 * import { resumeJobs } from '@/lib/config/content'
 *
 * // Model configs
 * import { getModelConfig } from '@/lib/config/models'
 *
 * // Or use centralized imports from subdirectories
 * import * as designConfig from '@/lib/config/design'
 * import * as navConfig from '@/lib/config/navigation'
 * ```
 */

// Core types
export * from './types'

// Design system configurations
export * from './design'

// Navigation configurations
export * from './navigation'

// Content configurations
export * from './content'

// Annotation configurations
export * from './annotations'

// Particle system configurations
export * from './particles'

// Domain expertise configurations
export * from './expertise'

// Component registry configurations
export * from './registry'

// Route blocklist configuration
export * from './route-blocklist.config'

// Route access configuration (SINGLE SOURCE OF TRUTH for access levels)
export * from './route-access.config'
