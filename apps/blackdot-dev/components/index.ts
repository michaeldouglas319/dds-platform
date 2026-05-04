/**
 * Components Root Barrel Export
 *
 * Re-exports all component categories using workspace-style imports.
 * Provides convenient access to all components via `@/components/*` paths.
 *
 * Usage:
 *   import { Button } from '@/components/ui'
 *   import { PitchDeckHero } from '@/components/PitchDeck'
 *   import { UnifiedScrollLayout } from '@/components/layouts'
 *
 * Category Imports:
 *   @/components/ui - Layer 1: Base UI components
 *   @/components/PitchDeck - Layer 2: Pitch deck components
 *   @/components/sections - Layer 2: Section components
 *   @/components/resume - Layer 2: Resume components
 *   @/components/layouts - Layer 3: Full-page layouts
 *   @/components/layout - Layer 3: Navigation components
 */

// Root level composite components
export { ThemeProvider } from './theme-provider';
export { FrameWithContent } from './FrameWithContent';
export { PitchDeckSection } from './PitchDeckSection';
export { QuickNavSidebar } from './QuickNavSidebar';
export { SceneErrorBoundary } from './SceneErrorBoundary';

// For convenience, also export category imports
export * as UI from './ui';
export * as PitchDeck from './PitchDeck';
export * as Sections from './sections';
export * as Layouts from './layouts';
export * as Layout from './shared/layout';
export * as Resume from './resume';
export * as Dashboard from './dashboard';
export * as Editor from './editor';
export * as Dashboard3D from './3d-dashboard';
