/**
 * Library Root Barrel Export
 *
 * Re-exports all lib categories using workspace-style imports.
 * Provides convenient access to all library modules via `@/lib/*` paths.
 *
 * Usage:
 *   import { useModelAutoScaling } from '@/lib/threejs/utils'
 *   import { sections } from '@/lib/config'
 *   import { parseMarkdown } from '@/lib/utils'
 *   import { CyclingText } from '@/lib/components'
 *
 * Category Imports:
 *   @/lib/threejs/utils - Three.js optimization utilities
 *   @/lib/scenes/models - 3D model components
 *   @/lib/components - Library components
 *   @/lib/config - Configuration files
 *   @/lib/utils - General utilities
 */

// For convenience, export category namespaces
export * as ThreeJSUtils from './threejs/utils';
export * as LibConfig from './config';
export * as LibUtils from './utils';
export * as LibComponents from './components';
