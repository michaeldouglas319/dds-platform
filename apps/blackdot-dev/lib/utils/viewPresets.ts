/**
 * View Preset Utility Functions
 *
 * Helper functions for working with view presets and responsive behavior.
 */

import {
  VIEW_PRESETS,
  type ViewPresetConfig,
  type BreakpointSize,
  getBreakpointAt,
  DEFAULT_BREAKPOINTS,
  getSpacingMultiplier,
} from '@/lib/config/design/views.config'

/**
 * Get all available view preset IDs
 */
export function getAllPresetIds(): string[] {
  return Object.keys(VIEW_PRESETS)
}

/**
 * Get all view presets
 */
export function getAllPresets(): ViewPresetConfig[] {
  return Object.values(VIEW_PRESETS)
}

/**
 * Check if mobile behavior should apply
 */
export function shouldApplyMobileBehavior(
  width: number,
  preset: ViewPresetConfig
): boolean {
  const breakpoint = getBreakpointAt(width, preset.breakpoints)
  return breakpoint === 'mobile' || breakpoint === 'tablet'
}

/**
 * Apply preset-specific mobile behaviors
 */
export interface AppliedMobileBehaviors {
  hideCanvas: boolean
  collapseSidebar: boolean
  stackLayout: boolean
  showInlineModels: boolean
  reduceAnimations: boolean
  singleColumnGrid: boolean
}

export function getAppliedMobileBehaviors(
  width: number,
  preset: ViewPresetConfig
): AppliedMobileBehaviors {
  const isMobile = shouldApplyMobileBehavior(width, preset)

  return {
    hideCanvas: isMobile && (preset.mobileBehavior.hideCanvas ?? false),
    collapseSidebar:
      isMobile && (preset.mobileBehavior.collapseSidebar ?? false),
    stackLayout: isMobile && (preset.mobileBehavior.stackLayout ?? false),
    showInlineModels:
      isMobile && (preset.mobileBehavior.showInlineModels ?? false),
    reduceAnimations:
      isMobile && (preset.mobileBehavior.reduceAnimations ?? false),
    singleColumnGrid:
      isMobile && (preset.mobileBehavior.singleColumnGrid ?? false),
  }
}

/**
 * Get responsive grid columns based on preset and viewport width
 */
export function getGridColumns(
  width: number,
  preset: ViewPresetConfig
): number {
  const breakpoint = getBreakpointAt(width, preset.breakpoints)
  const behaviors = getAppliedMobileBehaviors(width, preset)

  if (behaviors.singleColumnGrid) return 1

  switch (breakpoint) {
    case 'mobile':
      return 1
    case 'tablet':
      return 2
    case 'desktop':
      return 3
    case 'wide':
      return 4
  }
}

/**
 * Get sidebar width in pixels
 */
export function getSidebarWidth(preset: ViewPresetConfig): number | null {
  if (!preset.sidebarWidth) return null

  // Handle rem values
  if (preset.sidebarWidth.includes('rem')) {
    const remValue = parseFloat(preset.sidebarWidth)
    return remValue * 16 // 16px per rem
  }

  // Handle px values
  if (preset.sidebarWidth.includes('px')) {
    return parseFloat(preset.sidebarWidth)
  }

  return null
}

/**
 * Check if sidebar should be visible at given width
 */
export function isSidebarVisible(
  width: number,
  preset: ViewPresetConfig
): boolean {
  if (!preset.sidebarWidth) return false

  const behaviors = getAppliedMobileBehaviors(width, preset)
  if (behaviors.collapseSidebar) return false

  const sidebarWidth = getSidebarWidth(preset)
  if (!sidebarWidth) return false

  return width > preset.breakpoints.desktop
}

/**
 * Calculate canvas resolution multiplier based on quality preset
 */
export function getCanvasResolution(preset: ViewPresetConfig): number {
  return preset.qualitySettings[preset.qualityPreset].canvasResolution
}

/**
 * Calculate max meshes based on quality preset
 */
export function getMaxMeshes(preset: ViewPresetConfig): number {
  return preset.qualitySettings[preset.qualityPreset].maxMeshes
}

/**
 * Calculate shadow map resolution based on quality preset
 */
export function getShadowMapResolution(preset: ViewPresetConfig): number {
  return preset.qualitySettings[preset.qualityPreset].shadowMapResolution
}

/**
 * Get CSS classes for layout based on preset
 */
export function getLayoutClasses(
  preset: ViewPresetConfig,
  width?: number
): string[] {
  const classes: string[] = []

  // Canvas positioning
  if (preset.canvasPosition === 'fixed') {
    classes.push('canvas-fixed')
  }

  // Overlay layout
  if (preset.overlayLayout) {
    classes.push('overlay-content')
  }

  // Scroll behavior
  if (preset.scrollBehavior === 'smooth') {
    classes.push('scroll-smooth')
  }

  // Mobile behaviors
  if (width) {
    const behaviors = getAppliedMobileBehaviors(width, preset)
    if (behaviors.hideCanvas) classes.push('hide-canvas')
    if (behaviors.stackLayout) classes.push('stack-layout')
    if (behaviors.reduceAnimations) classes.push('reduce-motion')
  }

  return classes
}

/**
 * Get preset by approximate layout type
 */
export function getPresetByLayoutType(
  type: 'scroll' | 'immersive' | 'dashboard' | 'landing'
): ViewPresetConfig | undefined {
  switch (type) {
    case 'scroll':
      return VIEW_PRESETS['scroll3D']
    case 'immersive':
      return VIEW_PRESETS['immersive3D']
    case 'dashboard':
      return VIEW_PRESETS['dashboardGrid']
    case 'landing':
      return VIEW_PRESETS['landingHero']
    default:
      return undefined
  }
}

/**
 * Check if reduced motion should be applied
 */
export function shouldReduceMotion(
  width: number,
  preset: ViewPresetConfig
): boolean {
  const behaviors = getAppliedMobileBehaviors(width, preset)
  return behaviors.reduceAnimations
}

/**
 * Get readable name for preset
 */
export function getPresetDisplayName(presetId: string): string {
  const preset = VIEW_PRESETS[presetId]
  return preset?.name ?? presetId
}

/**
 * Get description for preset
 */
export function getPresetDescription(presetId: string): string {
  const preset = VIEW_PRESETS[presetId]
  return preset?.description ?? ''
}
