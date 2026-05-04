'use client'

import React, {
  lazy,
  Suspense,
  useState,
  useEffect,
  useMemo,
  useCallback,
  CSSProperties
} from 'react'
import { animated, useSpring, config } from '@react-spring/web'

/**
 * Landing variant type definition
 */
type LandingVariant = 'v1' | 'v2' | 'v3' | 'v4'

/**
 * Props for the LandingRouter component
 */
interface LandingRouterProps {
  /**
   * The landing page variant to display
   * @default 'v4'
   * - 'v1': Orbital lighting variant
   * - 'v2': Auth integration variant
   * - 'v3': Minimalist design with particles
   * - 'v4': Video projection cube grid (default)
   * - 'random': Cycles through all variants
   */
  variant?: 'v1' | 'v2' | 'v3' | 'v4' | 'random'

  /**
   * Transition duration in milliseconds
   * @default 600
   */
  transitionDuration?: number

  /**
   * Optional callback when variant changes
   */
  onVariantChange?: (variant: LandingVariant) => void

  /**
   * Optional CSS class to apply to the root container
   */
  className?: string

  /**
   * Optional inline styles for the root container
   */
  style?: CSSProperties
}

/**
 * Lazy-loaded landing page components
 * Uses React.lazy() for code splitting to improve initial load time
 */
const LandingV1 = lazy(() =>
  import('./LandingV1').then(module => ({ default: module.default }))
)

const LandingV2 = lazy(() =>
  import('./LandingV2').then(module => ({ default: module.default }))
)

const LandingV3 = lazy(() =>
  import('./LandingV3').then(module => ({ default: module.default }))
)

const LandingV4 = lazy(() =>
  import('./LandingV4').then(module => ({ default: module.default }))
)

/**
 * Loading fallback component - simple spinner during lazy loading
 */
const LoadingFallback: React.FC = () => {
  const spinAnimation = useSpring({
    from: { rotate: 0 },
    to: { rotate: 360 },
    loop: true,
    config: { duration: 1000 },
  })

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        position: 'fixed',
        inset: 0,
        zIndex: 0,
      }}
      role="status"
      aria-label="Loading landing page"
    >
      <animated.div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          border: '3px solid rgba(255, 255, 255, 0.2)',
          borderTopColor: 'rgba(59, 130, 246, 1)',
          ...spinAnimation,
        }}
      />
    </div>
  )
}

/**
 * Get all available landing variants in order for random cycling
 */
const LANDING_VARIANTS: LandingVariant[] = ['v1', 'v2', 'v3', 'v4']

/**
 * Get the next variant in the cycle
 */
const getNextVariant = (current: LandingVariant): LandingVariant => {
  const currentIndex = LANDING_VARIANTS.indexOf(current)
  const nextIndex = (currentIndex + 1) % LANDING_VARIANTS.length
  return LANDING_VARIANTS[nextIndex]
}

/**
 * LandingRouter Component
 *
 * A flexible router for switching between different landing page variants
 * with smooth CSS transitions and lazy loading for code splitting.
 *
 * Features:
 * - Three landing variants: V1 (orbital), V2 (auth), V3 (minimalist)
 * - Random mode that cycles through all variants
 * - Smooth fade transitions between variants
 * - Code splitting with React.lazy() and Suspense
 * - Maintains auth state across variant changes
 * - Full TypeScript support with proper types
 * - Graceful loading states
 *
 * Usage:
 * ```tsx
 * // Use default variant (V3)
 * <LandingRouter />
 *
 * // Use specific variant
 * <LandingRouter variant="v1" />
 *
 * // Random cycling mode
 * <LandingRouter variant="random" />
 *
 * // With callbacks
 * <LandingRouter
 *   variant="v2"
 *   onVariantChange={(v) => console.log(`Switched to ${v}`)}
 *   transitionDuration={800}
 * />
 * ```
 */
export function LandingRouter({
  variant = 'v4',
  transitionDuration = 600,
  onVariantChange,
  className,
  style,
}: LandingRouterProps): React.ReactElement {
  // Track current variant after resolution
  const [currentVariant, setCurrentVariant] = useState<LandingVariant>('v4')

  // Track the effective variant (resolves 'random')
  const [effectiveVariant, setEffectiveVariant] = useState<LandingVariant>('v4')

  // Track random cycling interval
  const randomIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  // Resolve variant (handle 'random' mode)
  useEffect(() => {
    if (variant === 'random') {
      // Set initial random variant
      const randomVariant = LANDING_VARIANTS[
        Math.floor(Math.random() * LANDING_VARIANTS.length)
      ]
      setEffectiveVariant(randomVariant)
      setCurrentVariant(randomVariant)

      // Clear existing interval
      if (randomIntervalRef.current) {
        clearInterval(randomIntervalRef.current)
      }

      // Set up cycling interval (cycle every 10 seconds in random mode)
      randomIntervalRef.current = setInterval(() => {
        setEffectiveVariant(prev => {
          const next = getNextVariant(prev)
          setCurrentVariant(next)
          onVariantChange?.(next)
          return next
        })
      }, 10000)

      return () => {
        if (randomIntervalRef.current) {
          clearInterval(randomIntervalRef.current)
          randomIntervalRef.current = null
        }
      }
    } else {
      // Clear interval if exiting random mode
      if (randomIntervalRef.current) {
        clearInterval(randomIntervalRef.current)
        randomIntervalRef.current = null
      }

      // Set specific variant
      if (effectiveVariant !== variant) {
        setEffectiveVariant(variant)
        setCurrentVariant(variant)
        onVariantChange?.(variant)
      }
    }
  }, [variant, onVariantChange])

  // Fade animation for smooth transitions
  const fadeAnimation = useSpring({
    opacity: 1,
    config: { ...config.gentle, duration: transitionDuration },
  })

  // Select the component to render
  const SelectedComponent = useMemo(() => {
    switch (effectiveVariant) {
      case 'v1':
        return LandingV1
      case 'v2':
        return LandingV2
      case 'v3':
        return LandingV3
      case 'v4':
      default:
        return LandingV4
    }
  }, [effectiveVariant])

  return (
    <animated.div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        ...fadeAnimation,
        ...style,
      }}
      className={className}
      data-landing-variant={effectiveVariant}
      role="main"
      aria-label={`Landing page - variant ${effectiveVariant}`}
    >
      <Suspense fallback={<LoadingFallback />}>
        <SelectedComponent />
      </Suspense>
    </animated.div>
  )
}

export default LandingRouter
