'use client'

import React, { useEffect, useState, ReactNode } from 'react'
import {
  getViewPreset,
  type ViewPresetConfig,
  VIEW_PRESETS,
} from '@/lib/config/design/views.config'
import {
  getAppliedMobileBehaviors,
  getLayoutClasses,
  getSidebarWidth,
  getGridColumns,
} from '@/lib/utils/viewPresets'
import { cn } from '@/lib/utils'

/**
 * ViewContainer - Layout preset consumer component
 *
 * Applies a view preset configuration to a page, handling responsive behavior,
 * spacing, quality settings, and mobile optimizations automatically.
 *
 * @category layout
 * @layer 3
 * @example
 * ```tsx
 * import { ViewContainer } from '@/components/layouts'
 * import { VIEW_PRESETS } from '@/lib/config/views.config'
 *
 * export default function MyPage() {
 *   return (
 *     <ViewContainer preset={VIEW_PRESETS.scroll3D}>
 *       <YourPageContent />
 *     </ViewContainer>
 *   )
 * }
 * ```
 */

export interface ViewContainerProps {
  /** View preset configuration (string ID or full config object) */
  preset: string | ViewPresetConfig
  /** Main content to render */
  children: ReactNode
  /** Additional CSS classes */
  className?: string
  /** Additional styles */
  style?: React.CSSProperties
}

export function ViewContainer({
  preset: presetProp,
  children,
  className,
  style,
}: ViewContainerProps) {
  const [viewportWidth, setViewportWidth] = useState<number>(0)
  const [isHydrated, setIsHydrated] = useState(false)

  // Track viewport width for responsive behavior (must be before early return)
  useEffect(() => {
    setIsHydrated(true)

    // Set initial width
    if (typeof window !== 'undefined') {
      setViewportWidth(window.innerWidth)
    }

    // Handle resize
    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Get preset configuration
  const preset =
    typeof presetProp === 'string'
      ? getViewPreset(presetProp)
      : (presetProp as ViewPresetConfig)

  if (!preset) {
    console.warn(`ViewContainer: Invalid preset: ${presetProp}`)
    return <div className={cn('w-full', className)}>{children}</div>
  }

  // Apply mobile behaviors
  const mobileBehaviors = isHydrated
    ? getAppliedMobileBehaviors(viewportWidth, preset)
    : { hideCanvas: false, collapseSidebar: false, stackLayout: false, showInlineModels: false, reduceAnimations: false, singleColumnGrid: false }

  // Get layout classes
  const layoutClasses = isHydrated
    ? getLayoutClasses(preset, viewportWidth)
    : []

  // Calculate sidebar width
  const sidebarWidth = getSidebarWidth(preset)
  const gridColumns = isHydrated ? getGridColumns(viewportWidth, preset) : 3

  // Build combined class list
  const containerClasses = cn(
    'w-full',
    preset.scrollBehavior === 'smooth' && 'scroll-smooth',
    layoutClasses,
    className
  )

  // Build inline styles
  const containerStyle: React.CSSProperties = {
    ...style,
    '--view-preset-spacing': preset.spacing,
    '--view-preset-quality': preset.qualityPreset,
    '--grid-columns': gridColumns,
    ...((sidebarWidth ?? 0) > 0 && {
      '--sidebar-width': `${sidebarWidth}px`,
    }),
  } as React.CSSProperties

  return (
    <div className={containerClasses} style={containerStyle}>
      {/* Canvas hiding behavior */}
      {mobileBehaviors.hideCanvas && (
        <style>{'.canvas-hidden { display: none !important; }'}</style>
      )}

      {/* Reduced motion for animations */}
      {mobileBehaviors.reduceAnimations && (
        <style>{`
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        `}</style>
      )}

      {/* Render children with preset context */}
      <div
        className={cn(
          preset.overlayLayout && 'relative',
          mobileBehaviors.stackLayout && 'flex flex-col'
        )}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Hook to access current view preset context
 * @deprecated Use ViewContainer with preset prop instead
 */
export function useViewPreset(presetId: string): ViewPresetConfig | undefined {
  return getViewPreset(presetId)
}

/**
 * Hook to get current viewport behavior
 */
export function useViewportBehaviors(preset: ViewPresetConfig) {
  const [viewportWidth, setViewportWidth] = useState<number>(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewportWidth(window.innerWidth)
    }

    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return getAppliedMobileBehaviors(viewportWidth, preset)
}

/**
 * Hook to get grid columns for current viewport
 */
export function useGridColumns(preset: ViewPresetConfig): number {
  const [viewportWidth, setViewportWidth] = useState<number>(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewportWidth(window.innerWidth)
    }

    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return getGridColumns(viewportWidth, preset)
}

export default ViewContainer
