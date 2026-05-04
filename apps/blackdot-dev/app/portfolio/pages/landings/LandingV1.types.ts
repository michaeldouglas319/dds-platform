/**
 * LandingV1 - TypeScript Types and Interfaces Reference
 *
 * Complete type definitions for the modernized landing page
 * Includes all auth states, configuration, events, and component props
 */

import { CSSProperties, ReactNode, ComponentType } from 'react'
import { SpringValue } from '@react-spring/web'

/**
 * Authentication State Union Type
 * - unauthenticated: User is not logged in (default state)
 * - authenticating: Sign-in process is in progress
 * - authenticated: User is successfully logged in
 * - error: Authentication failed, error message available
 */
export type AuthState = 'unauthenticated' | 'authenticating' | 'authenticated' | 'error'

/**
 * Configuration options for landing page animations and behavior
 */
export interface LandingPageConfig {
  /** Duration of auth state transitions in milliseconds (default: 800) */
  animationDuration: number

  /** Enable particle effects on the landing page (default: true) */
  enableParticles: boolean

  /** Number of particles to render (default: 40) */
  particleCount: number

  /** Enable sound effects for interactions (default: false) */
  enableSound: boolean

  /** Overlay opacity when showing sign-in prompt (default: 0.7) */
  overlayOpacity?: number

  /** Custom overlay text (default: "Click anywhere to sign in") */
  signInText?: string

  /** Animation variant for overlay: 'pulse' or 'scale' (default: 'pulse') */
  animationVariant?: 'pulse' | 'scale'

  /** Enable keyboard shortcuts (default: true) */
  enableKeyboardShortcuts?: boolean
}

/**
 * Landing page state management interface
 */
export interface LandingPageState {
  /** Current authentication state */
  authState: AuthState

  /** Configuration object */
  config: LandingPageConfig

  /** Error message if authentication failed */
  error: string | null

  /** Whether page is currently transitioning between states */
  isTransitioning: boolean

  /** Whether sign-in is in progress */
  isSignInLoading?: boolean

  /** Currently active navigation item */
  activeNavItem?: string
}

/**
 * Actions available for managing landing page state
 */
export interface LandingPageActions {
  /** Update authentication state */
  setAuthState: (state: AuthState) => void

  /** Update configuration */
  setConfig: (config: Partial<LandingPageConfig>) => void

  /** Set error message */
  setError: (error: string | null) => void

  /** Attempt sign-in */
  signIn: (email: string, password: string) => Promise<void>

  /** Sign out user */
  signOut: () => Promise<void>

  /** Reset page to initial state */
  reset: () => void
}

/**
 * Spring animation values for auth transitions
 */
export interface AuthSpringValues {
  /** Opacity animation (0-1) */
  opacity: SpringValue<number>

  /** Scale animation (0.95-1) */
  scale: SpringValue<number>
}

/**
 * Child element animation values for cascading effects
 */
export interface ChildAnimationValues {
  /** Opacity for child element */
  opacity: SpringValue<number>

  /** Vertical translation for child element */
  translateY: SpringValue<number>
}

/**
 * Animation configuration options
 */
export interface AnimationConfig {
  /** Animation duration in milliseconds (default: 600) */
  duration?: number

  /** Spring tension (default: 170) */
  tension?: number

  /** Spring friction (default: 26) */
  friction?: number

  /** Starting scale value (default: 0.95) */
  scaleIn?: number

  /** Enable cascading animations (default: true) */
  enableCascade?: boolean

  /** Delay between cascading children in milliseconds (default: 50) */
  cascadeDelay?: number
}

/**
 * User authentication information
 */
export interface UserInfo {
  /** Unique user identifier */
  id: string

  /** User email address */
  email: string

  /** User full name */
  name?: string

  /** User role for RBAC */
  role?: 'admin' | 'user' | 'guest'

  /** User permissions */
  permissions?: string[]

  /** Avatar URL */
  avatarUrl?: string

  /** Session expiration timestamp */
  sessionExpiresAt?: number

  /** Whether account has been verified */
  isVerified?: boolean

  /** MFA enabled flag */
  mfaEnabled?: boolean
}

/**
 * Authentication response from sign-in endpoint
 */
export interface AuthResponse {
  /** Whether authentication was successful */
  success: boolean

  /** Authentication token for subsequent requests */
  token?: string

  /** Refresh token for session renewal */
  refreshToken?: string

  /** User information after successful auth */
  user?: UserInfo

  /** Error message if authentication failed */
  error?: string

  /** Error code for specific error handling */
  errorCode?: string

  /** Whether MFA is required */
  mfaRequired?: boolean

  /** Temporary token for MFA verification */
  tempToken?: string

  /** Session expiration time */
  expiresIn?: number
}

/**
 * Sign-in form data
 */
export interface SignInFormData {
  /** User email address */
  email: string

  /** User password */
  password: string

  /** Remember login (optional) */
  rememberMe?: boolean

  /** MFA code if required (optional) */
  mfaCode?: string
}

/**
 * Error information for display
 */
export interface ErrorInfo {
  /** Human-readable error message */
  message: string

  /** Error code for programmatic handling */
  code: string

  /** Error severity: 'info' | 'warning' | 'error' | 'critical' */
  severity: 'info' | 'warning' | 'error' | 'critical'

  /** When error occurred */
  timestamp: number

  /** Whether error is recoverable */
  recoverable: boolean

  /** Suggested action for user */
  suggestedAction?: string

  /** Retry count (for retry scenarios) */
  retryCount?: number

  /** Maximum retries allowed */
  maxRetries?: number
}

/**
 * Navigation item configuration
 */
export interface NavigationItemConfig {
  /** Unique identifier */
  id: string

  /** Display label */
  label: string

  /** Icon (emoji or SVG) */
  icon?: string

  /** Callback when clicked */
  onClick: () => void | Promise<void>

  /** Whether item is currently active */
  isActive?: boolean

  /** ARIA label for accessibility */
  ariaLabel?: string

  /** Test ID for testing */
  testId?: string

  /** Whether item is disabled */
  disabled?: boolean

  /** Badge count (e.g., notifications) */
  badge?: number

  /** Custom class name */
  className?: string

  /** Custom inline styles */
  style?: CSSProperties
}

/**
 * Overlay component configuration
 */
export interface OverlayConfig {
  /** Whether overlay is visible */
  isVisible: boolean

  /** Background opacity (0-1) */
  opacity: number

  /** Text to display */
  text: string

  /** Whether loading indicator should show */
  isLoading?: boolean

  /** Loading text */
  loadingText?: string

  /** Animation variant */
  animationVariant?: 'pulse' | 'scale'

  /** z-index value */
  zIndex?: number

  /** Callback when clicking overlay */
  onOverlayClick?: () => void | Promise<void>

  /** Callback when closing overlay */
  onClose?: () => void
}

/**
 * Landing page event types
 */
export type LandingPageEventType =
  | 'sign_in_started'
  | 'sign_in_success'
  | 'sign_in_failed'
  | 'sign_out'
  | 'navigation_changed'
  | 'auth_state_changed'
  | 'error_occurred'
  | 'animation_complete'
  | 'mfa_required'
  | 'session_expired'

/**
 * Landing page event
 */
export interface LandingPageEvent {
  /** Event type */
  type: LandingPageEventType

  /** When event occurred */
  timestamp: number

  /** Event metadata */
  data?: Record<string, any>

  /** User ID if available */
  userId?: string
}

/**
 * Event listener callback
 */
export type LandingPageEventListener = (event: LandingPageEvent) => void

/**
 * Event emitter for landing page events
 */
export interface LandingPageEventEmitter {
  /** Register event listener */
  on: (type: LandingPageEventType, listener: LandingPageEventListener) => () => void

  /** Emit event */
  emit: (event: LandingPageEvent) => void

  /** Remove listener */
  off: (type: LandingPageEventType, listener: LandingPageEventListener) => void

  /** Clear all listeners */
  clear: () => void
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  /** Primary brand color */
  primaryColor: string

  /** Secondary color */
  secondaryColor: string

  /** Error color */
  errorColor: string

  /** Success color */
  successColor: string

  /** Background color */
  backgroundColor: string

  /** Text color */
  textColor: string

  /** Accent color */
  accentColor: string

  /** Whether dark mode is enabled */
  isDarkMode: boolean

  /** Border radius for components */
  borderRadius: number

  /** Animation duration */
  animationDuration: number

  /** Custom CSS variables */
  customProperties?: Record<string, string>
}

/**
 * Landing page statistics
 */
export interface LandingPageStats {
  /** Total sign-in attempts */
  signInAttempts: number

  /** Successful sign-ins */
  successfulSignIns: number

  /** Failed sign-in attempts */
  failedSignIns: number

  /** Average sign-in time in milliseconds */
  averageSignInTime: number

  /** Total sessions */
  totalSessions: number

  /** Current active sessions */
  activeSessions: number

  /** Last sign-in timestamp */
  lastSignInAt?: number

  /** User engagement metrics */
  metrics?: {
    buttonClickCount: number
    navigationChanges: number
    errorCount: number
  }
}

/**
 * Landing page configuration object
 */
export interface LandingPageConfiguration {
  /** Feature flags */
  features: {
    authEnabled: boolean
    navigationEnabled: boolean
    analyticsEnabled: boolean
    errorReportingEnabled: boolean
  }

  /** Authentication configuration */
  auth: {
    enableRememberMe: boolean
    enableMFA: boolean
    sessionTimeout: number
    maxLoginAttempts: number
  }

  /** UI configuration */
  ui: {
    animationDuration: number
    showParticles: boolean
    darkMode: boolean
    theme: ThemeConfig
  }

  /** Performance configuration */
  performance: {
    cacheEnabled: boolean
    cacheDuration: number
    preloadAssets: boolean
  }

  /** API configuration */
  api: {
    baseUrl: string
    timeout: number
    retryAttempts: number
    retryDelay: number
  }
}

/**
 * Callback function signatures
 */
export namespace Callbacks {
  /** Sign-in callback */
  export type SignIn = (data: SignInFormData) => Promise<AuthResponse>

  /** Sign-out callback */
  export type SignOut = () => Promise<void>

  /** Navigation callback */
  export type OnNavigate = (itemId: string) => void | Promise<void>

  /** Error callback */
  export type OnError = (error: ErrorInfo) => void

  /** State change callback */
  export type OnStateChange = (newState: AuthState, previousState: AuthState) => void

  /** Event callback */
  export type OnEvent = (event: LandingPageEvent) => void

  /** MFA callback */
  export type OnMFARequired = (tempToken: string) => Promise<string>
}

/**
 * Hook return types
 */
export namespace HookReturns {
  /** useLandingState hook return type */
  export interface UseLandingState extends LandingPageState, LandingPageActions {}

  /** useAuthTransition hook return type */
  export interface UseAuthTransition {
    springs: AuthSpringValues
    childSprings: ChildAnimationValues[]
    isAnimating: boolean
    authState: AuthState
    transitionTo: (newState: AuthState) => void
    resetAnimation: () => void
  }

  /** useResponsive hook return type */
  export interface UseResponsive {
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    screenWidth: number
    screenHeight: number
  }

  /** useTheme hook return type */
  export interface UseTheme {
    theme: ThemeConfig
    isDarkMode: boolean
    toggleTheme: () => void
    setTheme: (theme: Partial<ThemeConfig>) => void
  }

  /** useAuth hook return type */
  export interface UseAuth extends LandingPageState, LandingPageActions {
    user?: UserInfo
    isLoading: boolean
    signInWithProvider: (provider: 'google' | 'github') => Promise<void>
    refreshToken: () => Promise<void>
  }
}

/**
 * Component prop types
 */
export namespace ComponentProps {
  /** ClickToSignInOverlay props */
  export interface ClickToSignInOverlay {
    isVisible: boolean
    isLoading?: boolean
    onSignIn: () => void | Promise<void>
    onClose?: () => void
    overlayOpacity?: number
    signInText?: string
    enableKeyboardShortcuts?: boolean
    animationVariant?: 'pulse' | 'scale'
    zIndex?: number
  }

  /** NavigationDock props */
  export interface NavigationDock {
    items: NavigationItemConfig[]
    activeItemId?: string
    position?: 'bottom' | 'top' | 'left' | 'right'
    showIcons?: boolean
    showLabels?: boolean
    animationDuration?: number
    isVisible?: boolean
    onActiveItemChange?: (itemId: string) => void
    className?: string
    style?: CSSProperties
    darkMode?: boolean
    responsiveDirection?: 'vertical' | 'horizontal'
    enableKeyboardNav?: boolean
  }

  /** LandingV1 component props (self-contained, no props needed) */
  export interface LandingV1 {}
}

/**
 * Type guards and utility types
 */
export namespace TypeGuards {
  /** Check if state is authenticated */
  export const isAuthenticated = (state: AuthState): state is 'authenticated' =>
    state === 'authenticated'

  /** Check if state is authenticating */
  export const isAuthenticating = (state: AuthState): state is 'authenticating' =>
    state === 'authenticating'

  /** Check if state is error */
  export const isError = (state: AuthState): state is 'error' =>
    state === 'error'

  /** Check if state is unauthenticated */
  export const isUnauthenticated = (state: AuthState): state is 'unauthenticated' =>
    state === 'unauthenticated'
}

/**
 * Constant values
 */
export const CONSTANTS = {
  /** Default animation duration */
  DEFAULT_ANIMATION_DURATION: 800,

  /** Default particle count */
  DEFAULT_PARTICLE_COUNT: 40,

  /** Minimum login attempt delay (ms) */
  MIN_LOGIN_DELAY: 500,

  /** Maximum login attempts before cooldown */
  MAX_LOGIN_ATTEMPTS: 5,

  /** Login cooldown duration (ms) */
  LOGIN_COOLDOWN: 300000, // 5 minutes

  /** Session timeout (ms) */
  SESSION_TIMEOUT: 3600000, // 1 hour

  /** MFA code length */
  MFA_CODE_LENGTH: 6,

  /** Default z-index values */
  Z_INDEX: {
    BACKGROUND: 0,
    CONTENT: 10,
    OVERLAY: 9999,
    MODAL: 10000,
    NOTIFICATION: 11000,
  },

  /** Breakpoints for responsive design */
  BREAKPOINTS: {
    MOBILE: 640,
    TABLET: 1024,
    DESKTOP: 1280,
    WIDE: 1920,
  },

  /** Animation durations */
  ANIMATION_DURATIONS: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 600,
    SLOWER: 1000,
  },
} as const

export default {}
