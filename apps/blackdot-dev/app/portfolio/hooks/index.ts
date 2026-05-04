/**
 * Hooks Index
 *
 * Central export point for all custom React hooks used throughout the portfolio application.
 * All hooks are fully typed with TypeScript strict mode support.
 */

// Auth Transition Hooks
export {
  useAuthTransition,
  useAuthChildAnimations,
  useAuthStateManager,
  type AuthState,
  type AuthAnimationConfig,
  type AuthSpringValues,
  type ChildSpringValues,
  type UseAuthTransitionReturn,
} from './useAuthTransition'

// Landing State Hook
export {
  useLandingState,
  type AuthState as LandingAuthState,
  type LandingStateConfig,
  type LandingState,
  type LandingStateActions,
} from './useLandingState'

// Keyboard Navigation Hook
export {
  useKeyboardNavigation,
  type KeyboardNavigationConfig,
  type KeyboardState,
  type FocusHistoryEntry,
  type UseKeyboardNavigationReturn,
} from './useKeyboardNavigation'

// Accessibility Hook
export {
  useAccessibility,
  type AriaAttributes,
  type AriaRole,
  type AriaLiveType,
  type ContrastRatio,
  type UseAccessibilityReturn,
} from './useAccessibility'
