import { useCallback, useState, useEffect } from 'react'

export type AuthState = 'unauthenticated' | 'authenticating' | 'authenticated' | 'error'

export interface LandingStateConfig {
  animationDuration: number
  enableParticles: boolean
  particleCount: number
  enableSound: boolean
}

export interface LandingState {
  authState: AuthState
  config: LandingStateConfig
  error: string | null
  isTransitioning: boolean
}

export interface LandingStateActions {
  setAuthState: (state: AuthState) => void
  setConfig: (config: Partial<LandingStateConfig>) => void
  setError: (error: string | null) => void
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  reset: () => void
}

const DEFAULT_CONFIG: LandingStateConfig = {
  animationDuration: 800,
  enableParticles: true,
  particleCount: 40,
  enableSound: false,
}

export function useLandingState(
  initialAuthState: AuthState = 'unauthenticated'
): LandingState & LandingStateActions {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState)
  const [config, setConfigState] = useState<LandingStateConfig>(DEFAULT_CONFIG)
  const [error, setError] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const setConfig = useCallback((newConfig: Partial<LandingStateConfig>) => {
    setConfigState((prev) => ({ ...prev, ...newConfig }))
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsTransitioning(true)
      setAuthState('authenticating')
      setError(null)

      // Simulate auth delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In real app, call your auth API here
      // For demo, just validate email exists
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      setAuthState('authenticated')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      setError(message)
      setAuthState('error')
    } finally {
      setIsTransitioning(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      setIsTransitioning(true)
      setAuthState('unauthenticated')
      setError(null)
      // In real app, call logout API here
      await new Promise((resolve) => setTimeout(resolve, 500))
    } finally {
      setIsTransitioning(false)
    }
  }, [])

  const reset = useCallback(() => {
    setAuthState('unauthenticated')
    setError(null)
    setConfigState(DEFAULT_CONFIG)
    setIsTransitioning(false)
  }, [])

  return {
    authState,
    config,
    error,
    isTransitioning,
    setAuthState,
    setConfig,
    setError,
    signIn,
    signOut,
    reset,
  }
}
