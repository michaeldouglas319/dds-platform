'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { LoadingOverlayConfig } from '@/components/loading/ThreeDLoadingOverlay'

const ThreeDLoadingOverlay = dynamic(
  () => import('@/components/loading/ThreeDLoadingOverlay').then(m => m.ThreeDLoadingOverlay),
  { ssr: false }
)

const LoadingPresets: Record<string, LoadingOverlayConfig> = {
  navigation: { message: 'Loading page...', sphere: { color: '#3b82f6', emissiveColor: '#3b82f6', emissiveIntensity: 0.6, scale: 0.3 } },
  'route-registry': { message: 'Loading routes...', submessage: 'Configuring navigation', sphere: { color: '#8b5cf6', emissiveColor: '#8b5cf6', emissiveIntensity: 0.7, scale: 0.35 } },
  'auth-check': { message: 'Verifying access...', submessage: 'Checking permissions', sphere: { color: '#06b6d4', emissiveColor: '#06b6d4', emissiveIntensity: 0.5, scale: 0.28, pulseSpeed: 3 } },
  operation: { message: 'Processing...', sphere: { color: '#10b981', emissiveColor: '#10b981', emissiveIntensity: 0.6, scale: 0.3, pulseSpeed: 2.5 } },
  'data-load': { message: 'Loading data...', sphere: { color: '#f59e0b', emissiveColor: '#f59e0b', emissiveIntensity: 0.7, scale: 0.32 } },
}

type LoadingType = 'navigation' | 'route-registry' | 'auth-check' | 'operation' | 'data-load' | 'custom'

interface LoadingState {
  type: LoadingType
  config?: LoadingOverlayConfig
}

interface LoadingContextValue {
  /** Whether any loading operation is active */
  isLoading: boolean
  /** Current loading state */
  loading: LoadingState | null
  /** Start loading with a specific type and optional config */
  startLoading: (type: LoadingType, config?: LoadingOverlayConfig) => void
  /** Stop the current loading state */
  stopLoading: () => void
  /** Wrapper for async operations with automatic loading state */
  withLoading: <T>(
    operation: () => Promise<T>,
    type?: LoadingType,
    config?: LoadingOverlayConfig
  ) => Promise<T>
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined)

interface LoadingProviderProps {
  children: React.ReactNode
  /** Minimum time to show loading (ms) to prevent flashing */
  minLoadingTime?: number
  /** Debounce time before showing loading (ms) to prevent showing on fast operations */
  debounceTime?: number
}

/**
 * Global loading state provider with 3D overlay
 * Manages loading states for navigation, async operations, and route registry
 */
export function LoadingProvider({
  children,
  minLoadingTime = 300,
  debounceTime = 150,
}: LoadingProviderProps) {
  const [loading, setLoading] = useState<LoadingState | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  // Track timing for debouncing and minimum display time
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const startTimeRef = useRef<number>(0)
  const minTimeTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Auto-stop loading when pathname changes (navigation complete)
  useEffect(() => {
    if (loading?.type === 'navigation') {
      // Clear loading state on pathname change
      setIsVisible(false)
      setLoading(null)
    }
  }, [pathname, loading?.type])

  const startLoading = useCallback((type: LoadingType, config?: LoadingOverlayConfig) => {
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Get preset config if not provided
    const finalConfig = config || LoadingPresets[type] || LoadingPresets['operation']

    // Set loading state immediately
    setLoading({ type, config: finalConfig })
    startTimeRef.current = Date.now()

    // Debounce visibility to prevent flashing on fast operations
    debounceTimerRef.current = setTimeout(() => {
      setIsVisible(true)
    }, debounceTime)
  }, [debounceTime])

  const stopLoading = useCallback(() => {
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // If loading was visible, enforce minimum display time
    if (isVisible) {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = minLoadingTime - elapsed

      if (remaining > 0) {
        // Wait for minimum time before hiding
        minTimeTimerRef.current = setTimeout(() => {
          setIsVisible(false)
          setLoading(null)
        }, remaining)
      } else {
        // Minimum time already elapsed
        setIsVisible(false)
        setLoading(null)
      }
    } else {
      // Never became visible, just clear state
      setLoading(null)
      setIsVisible(false)
    }
  }, [isVisible, minLoadingTime])

  const withLoading = useCallback(async <T,>(
    operation: () => Promise<T>,
    type: LoadingType = 'operation',
    config?: LoadingOverlayConfig
  ): Promise<T> => {
    try {
      startLoading(type, config)
      return await operation()
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      if (minTimeTimerRef.current) clearTimeout(minTimeTimerRef.current)
    }
  }, [])

  const value: LoadingContextValue = {
    isLoading: isVisible,
    loading,
    startLoading,
    stopLoading,
    withLoading,
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <ThreeDLoadingOverlay
        isLoading={isVisible}
        config={loading?.config}
      />
    </LoadingContext.Provider>
  )
}

/**
 * Hook to access loading context
 * @throws Error if used outside LoadingProvider
 */
export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}

/**
 * Hook for navigation loading with automatic loading state
 * Use this in navigation components to show loading during route transitions
 */
export function useNavigationLoading() {
  const { startLoading, stopLoading } = useLoading()

  const startNavigation = useCallback(() => {
    startLoading('navigation')
  }, [startLoading])

  return { startNavigation, completeNavigation: stopLoading }
}

/**
 * Hook for async operations with automatic loading state
 * Wraps an async function with loading state management
 */
export function useLoadingOperation() {
  const { withLoading } = useLoading()
  return { withLoading }
}
