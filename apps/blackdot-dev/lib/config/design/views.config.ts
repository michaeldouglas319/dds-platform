/**
 * View Configuration Presets
 *
 * Defines 8 standard layout patterns used across DDS V3.
 * Each preset includes spacing, breakpoints, 3D quality settings, and mobile behaviors.
 */

export type SpacingPreset = 'compact' | 'standard' | 'generous'
export type QualityPreset = 'low' | 'medium' | 'high' | 'ultra'
export type BreakpointSize = 'mobile' | 'tablet' | 'desktop' | 'wide'

export interface ViewBreakpoints {
  mobile: number
  tablet: number
  desktop: number
  wide: number
}

export interface ViewSpacing {
  compact: number
  standard: number
  generous: number
}

export interface ViewQualitySettings {
  low: {
    canvasResolution: number
    maxMeshes: number
    shadowMapResolution: number
  }
  medium: {
    canvasResolution: number
    maxMeshes: number
    shadowMapResolution: number
  }
  high: {
    canvasResolution: number
    maxMeshes: number
    shadowMapResolution: number
  }
  ultra: {
    canvasResolution: number
    maxMeshes: number
    shadowMapResolution: number
  }
}

export interface ViewMobileBehavior {
  hideCanvas?: boolean
  collapseSidebar?: boolean
  stackLayout?: boolean
  showInlineModels?: boolean
  reduceAnimations?: boolean
  singleColumnGrid?: boolean
}

export interface ViewPresetConfig {
  id: string
  name: string
  description: string
  spacing: SpacingPreset
  breakpoints: ViewBreakpoints
  qualityPreset: QualityPreset
  qualitySettings: ViewQualitySettings
  mobileBehavior: ViewMobileBehavior
  sidebarWidth?: string
  canvasPosition?: 'fixed' | 'relative'
  overlayLayout?: boolean
  scrollBehavior?: 'smooth' | 'instant'
}

/**
 * Predefined breakpoints matching Tailwind conventions
 */
export const DEFAULT_BREAKPOINTS: ViewBreakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
}

/**
 * Predefined spacing scales
 */
export const SPACING_SCALES: Record<SpacingPreset, number> = {
  compact: 0.75,
  standard: 1,
  generous: 1.25,
}

/**
 * Quality settings for different preset levels
 */
export const QUALITY_SETTINGS: ViewQualitySettings = {
  low: {
    canvasResolution: 0.5,
    maxMeshes: 500,
    shadowMapResolution: 512,
  },
  medium: {
    canvasResolution: 0.75,
    maxMeshes: 1000,
    shadowMapResolution: 1024,
  },
  high: {
    canvasResolution: 1,
    maxMeshes: 2000,
    shadowMapResolution: 2048,
  },
  ultra: {
    canvasResolution: 1.5,
    maxMeshes: 4000,
    shadowMapResolution: 4096,
  },
}

/**
 * View Preset Definitions
 * 8 layout patterns for different use cases
 */
export const VIEW_PRESETS: Record<string, ViewPresetConfig> = {
  scroll3D: {
    id: 'scroll3D',
    name: 'Scroll 3D Layout',
    description: 'Fixed sidebar + 3D canvas + scrolling overlay content',
    spacing: 'standard',
    breakpoints: DEFAULT_BREAKPOINTS,
    qualityPreset: 'high',
    qualitySettings: QUALITY_SETTINGS,
    mobileBehavior: {
      hideCanvas: true,
      collapseSidebar: true,
      stackLayout: true,
      showInlineModels: true,
      reduceAnimations: true,
    },
    sidebarWidth: '18rem',
    canvasPosition: 'fixed',
    overlayLayout: true,
    scrollBehavior: 'smooth',
  },

  immersive3D: {
    id: 'immersive3D',
    name: 'Immersive 3D Layout',
    description: 'Full-screen canvas with overlay UI elements',
    spacing: 'generous',
    breakpoints: DEFAULT_BREAKPOINTS,
    qualityPreset: 'ultra',
    qualitySettings: QUALITY_SETTINGS,
    mobileBehavior: {
      hideCanvas: false,
      collapseSidebar: true,
      stackLayout: true,
      reduceAnimations: false,
    },
    canvasPosition: 'fixed',
    overlayLayout: true,
    scrollBehavior: 'instant',
  },

  splitPanel: {
    id: 'splitPanel',
    name: 'Split Panel Layout',
    description: 'Resizable viewport with controls panel',
    spacing: 'standard',
    breakpoints: DEFAULT_BREAKPOINTS,
    qualityPreset: 'medium',
    qualitySettings: QUALITY_SETTINGS,
    mobileBehavior: {
      collapseSidebar: true,
      stackLayout: true,
      singleColumnGrid: true,
    },
    canvasPosition: 'relative',
    overlayLayout: false,
    scrollBehavior: 'smooth',
  },

  cardPortal: {
    id: 'cardPortal',
    name: 'Card Portal Layout',
    description: 'Navigation hub with 3D background',
    spacing: 'generous',
    breakpoints: DEFAULT_BREAKPOINTS,
    qualityPreset: 'high',
    qualitySettings: QUALITY_SETTINGS,
    mobileBehavior: {
      hideCanvas: true,
      stackLayout: true,
      showInlineModels: false,
      singleColumnGrid: true,
    },
    canvasPosition: 'fixed',
    overlayLayout: true,
    scrollBehavior: 'smooth',
  },

  simulator: {
    id: 'simulator',
    name: 'Simulator Layout',
    description: 'Canvas + collapsible controls',
    spacing: 'standard',
    breakpoints: DEFAULT_BREAKPOINTS,
    qualityPreset: 'high',
    qualitySettings: QUALITY_SETTINGS,
    mobileBehavior: {
      collapseSidebar: true,
      stackLayout: true,
      reduceAnimations: true,
    },
    canvasPosition: 'relative',
    overlayLayout: false,
    scrollBehavior: 'instant',
  },

  dashboardGrid: {
    id: 'dashboardGrid',
    name: 'Dashboard Grid Layout',
    description: 'Responsive card grid (2/3/4 columns)',
    spacing: 'standard',
    breakpoints: DEFAULT_BREAKPOINTS,
    qualityPreset: 'medium',
    qualitySettings: QUALITY_SETTINGS,
    mobileBehavior: {
      singleColumnGrid: true,
      stackLayout: true,
    },
    canvasPosition: 'relative',
    overlayLayout: false,
    scrollBehavior: 'smooth',
  },

  landingHero: {
    id: 'landingHero',
    name: 'Landing Hero Layout',
    description: 'Full canvas with text overlay',
    spacing: 'generous',
    breakpoints: DEFAULT_BREAKPOINTS,
    qualityPreset: 'ultra',
    qualitySettings: QUALITY_SETTINGS,
    mobileBehavior: {
      hideCanvas: true,
      stackLayout: true,
      showInlineModels: false,
    },
    canvasPosition: 'fixed',
    overlayLayout: true,
    scrollBehavior: 'smooth',
  },

  listDetail: {
    id: 'listDetail',
    name: 'List Detail Layout',
    description: 'Sidebar list + main content',
    spacing: 'standard',
    breakpoints: DEFAULT_BREAKPOINTS,
    qualityPreset: 'medium',
    qualitySettings: QUALITY_SETTINGS,
    mobileBehavior: {
      collapseSidebar: true,
      stackLayout: true,
      singleColumnGrid: true,
    },
    sidebarWidth: '16rem',
    canvasPosition: 'relative',
    overlayLayout: false,
    scrollBehavior: 'smooth',
  },
}

/**
 * Get a view preset by ID
 */
export function getViewPreset(id: string): ViewPresetConfig | undefined {
  return VIEW_PRESETS[id]
}

/**
 * Check if a viewport width matches a breakpoint
 */
export function getBreakpointAt(
  width: number,
  breakpoints: ViewBreakpoints = DEFAULT_BREAKPOINTS
): BreakpointSize {
  if (width < breakpoints.tablet) return 'mobile'
  if (width < breakpoints.desktop) return 'tablet'
  if (width < breakpoints.wide) return 'desktop'
  return 'wide'
}

/**
 * Get spacing multiplier for given preset
 */
export function getSpacingMultiplier(spacing: SpacingPreset): number {
  return SPACING_SCALES[spacing]
}

/**
 * Calculate adjusted spacing value
 */
export function calculateSpacing(base: number, spacing: SpacingPreset): number {
  return base * getSpacingMultiplier(spacing)
}
