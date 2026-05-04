/**
 * Landing Page Hooks
 * Central export point for all custom React hooks used in the landing module
 */

// Landing State
export { useLandingState } from './useLandingState'

// Keyboard Navigation & Accessibility
export {
  useKeyboardNavigation,
  type KeyboardNavigationConfig,
  type KeyboardState,
  type FocusHistoryEntry,
  type UseKeyboardNavigationReturn,
} from './useKeyboardNavigation'

export {
  useAccessibility,
  type AriaAttributes,
  type AriaRole,
  type AriaLiveType,
  type ContrastRatio,
  type UseAccessibilityReturn,
} from './useAccessibility'

// Responsive Layout Hooks
export { useResponsiveButtonPositions } from './useResponsiveButtonPositions'
export { useResponsiveButtonScale } from './useResponsiveButtonScale'
export { useResponsiveLayout } from './useResponsiveLayout'
