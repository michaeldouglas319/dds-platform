import { useEffect, useState, useCallback, useRef } from 'react'
import { useSpring, useTrail, useTransition, config as springConfig, SpringValue } from '@react-spring/web'

/**
 * Auth state progression
 */
export type AuthState = 'unauthenticated' | 'authenticating' | 'authenticated'

/**
 * Custom animation configuration for auth transitions
 */
export interface AuthAnimationConfig {
  /** Duration in milliseconds (default: 600) */
  duration?: number
  /** Spring tension (default: 170) */
  tension?: number
  /** Spring friction (default: 26) */
  friction?: number
  /** Scale value for entering state (default: 0.95) */
  scaleIn?: number
  /** Enable cascade animation for child elements (default: true) */
  enableCascade?: boolean
  /** Cascade delay in milliseconds (default: 50) */
  cascadeDelay?: number
}

/**
 * Spring animation values for opacity and scale
 */
export interface AuthSpringValues {
  opacity: SpringValue<number>
  scale: SpringValue<number>
}

/**
 * Individual child animation values for cascading effect
 */
export interface ChildSpringValues {
  opacity: SpringValue<number>
  translateY: SpringValue<number>
}

/**
 * Return type for useAuthTransition hook
 */
export interface UseAuthTransitionReturn {
  /** Main spring animations for fade and scale */
  springs: AuthSpringValues
  /** Trail animations for cascading child elements */
  childSprings: ChildSpringValues[]
  /** Whether animations are currently running */
  isAnimating: boolean
  /** Current auth state */
  authState: AuthState
  /** Manually trigger transition to a new state */
  transitionTo: (newState: AuthState) => void
  /** Reset animations to initial state */
  resetAnimation: () => void
}

/**
 * Custom hook for managing smooth authentication state transitions with spring animations
 *
 * Features:
 * - Smooth opacity and scale transitions on auth state changes
 * - Cascading animations for child elements
 * - Customizable spring configuration (duration, tension, friction)
 * - Automatic reset on state changes
 * - Proper TypeScript typing with strict mode
 *
 * @param initialState - Initial auth state (default: 'unauthenticated')
 * @param config - Custom animation configuration
 * @returns Object containing springs, child springs, and animation state
 *
 * @example
 * ```tsx
 * const { springs, childSprings, isAnimating, authState } = useAuthTransition(
 *   'unauthenticated',
 *   { duration: 600, tension: 170, friction: 26 }
 * )
 *
 * return (
 *   <animated.div style={springs}>
 *     Child content here
 *   </animated.div>
 * )
 * ```
 */
export function useAuthTransition(
  initialState: AuthState = 'unauthenticated',
  config: AuthAnimationConfig = {}
): UseAuthTransitionReturn {
  // Merge config with defaults
  const mergedConfig = {
    duration: config.duration ?? 600,
    tension: config.tension ?? 170,
    friction: config.friction ?? 26,
    scaleIn: config.scaleIn ?? 0.95,
    enableCascade: config.enableCascade ?? true,
    cascadeDelay: config.cascadeDelay ?? 50,
  }

  const [authState, setAuthState] = useState<AuthState>(initialState)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevStateRef = useRef<AuthState>(initialState)
  const cascadeCountRef = useRef(4) // Number of child elements for cascade animation

  // Determine if we're entering or exiting
  const isEntering = authState !== 'unauthenticated'
  const stateChanged = prevStateRef.current !== authState

  // Update prev state ref
  useEffect(() => {
    if (stateChanged) {
      prevStateRef.current = authState
      setIsAnimating(true)
    }
  }, [authState, stateChanged])

  // Create spring config
  const springConfigObj =
    mergedConfig.duration > 0
      ? { duration: mergedConfig.duration }
      : {
          tension: mergedConfig.tension,
          friction: mergedConfig.friction,
        }

  // Main spring animation for opacity and scale
  const mainSpring = useSpring<AuthSpringValues>({
    opacity: isEntering ? 1 : 0,
    scale: isEntering ? 1 : mergedConfig.scaleIn,
    config: springConfigObj,
    onRest: () => {
      if (!stateChanged) {
        setIsAnimating(false)
      }
    },
  })

  // Trail animation for cascading child elements
  const childTrail = useTrail(mergedConfig.enableCascade ? cascadeCountRef.current : 0, () => ({
    from: { opacity: 0, translateY: 20 },
    to: { opacity: isEntering ? 1 : 0, translateY: isEntering ? 0 : 20 },
    config: springConfigObj,
    delay: (index: number) => (isEntering ? index * mergedConfig.cascadeDelay : 0),
  }))

  // Use trail directly as childSprings
  const childSprings: ChildSpringValues[] = childTrail as unknown as ChildSpringValues[]

  const transitionTo = useCallback((newState: AuthState) => {
    setAuthState(newState)
  }, [])

  const resetAnimation = useCallback(() => {
    setAuthState('unauthenticated')
    setIsAnimating(false)
    prevStateRef.current = 'unauthenticated'
  }, [])

  // Auto-reset animation flag after spring completes
  useEffect(() => {
    if (!isAnimating && stateChanged) {
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, mergedConfig.duration + 100)

      return () => clearTimeout(timer)
    }
  }, [stateChanged, isAnimating, mergedConfig.duration])

  return {
    springs: mainSpring,
    childSprings,
    isAnimating,
    authState,
    transitionTo,
    resetAnimation,
  }
}

/**
 * Helper hook to create staggered animations for multiple child elements
 * Useful for animating lists or multiple components in sequence
 *
 * @param itemCount - Number of items to animate
 * @param config - Animation configuration
 * @returns Array of spring values for each item
 */
export function useAuthChildAnimations(
  itemCount: number,
  config: AuthAnimationConfig = {}
): ChildSpringValues[] {
  const mergedConfig = {
    duration: config.duration ?? 600,
    tension: config.tension ?? 170,
    friction: config.friction ?? 26,
    cascadeDelay: config.cascadeDelay ?? 50,
  }

  const [isEntering, setIsEntering] = useState(true)

  const trail = useTrail(itemCount, () => ({
    from: { opacity: 0, translateY: 20 },
    to: { opacity: isEntering ? 1 : 0, translateY: isEntering ? 0 : 20 },
    config:
      mergedConfig.duration > 0
        ? { duration: mergedConfig.duration }
        : {
            tension: mergedConfig.tension,
            friction: mergedConfig.friction,
          },
    delay: (index: number) => index * mergedConfig.cascadeDelay,
  }))

  return trail as unknown as ChildSpringValues[]
}

/**
 * Type-safe hook for managing auth state transitions
 * Integrates with useAuthTransition for consistent animation behavior
 *
 * @param onStateChange - Callback when auth state changes
 * @returns Object with current state and transition methods
 */
export function useAuthStateManager(
  onStateChange?: (state: AuthState) => void
): {
  state: AuthState
  setState: (state: AuthState) => void
  loading: boolean
  setLoading: (loading: boolean) => void
} {
  const [state, setState] = useState<AuthState>('unauthenticated')
  const [loading, setLoading] = useState(false)

  const handleStateChange = useCallback(
    (newState: AuthState) => {
      setState(newState)
      onStateChange?.(newState)
    },
    [onStateChange]
  )

  return {
    state,
    setState: handleStateChange,
    loading,
    setLoading,
  }
}
