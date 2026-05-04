'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { AccessLevel, type AccessLevelType } from '@/lib/types/auth.types'

interface AuthContextType {
  /** Current user's access level */
  accessLevel: AccessLevelType
  /** Whether auth has been fully resolved (Clerk + role API) */
  isResolved: boolean
  /** Whether user is authenticated */
  isAuthenticated: boolean
  /** Whether currently loading auth */
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

/**
 * AuthProvider - Single source of truth for authentication state
 * Wraps entire app at root to avoid duplicate auth checks
 *
 * Provides:
 * - accessLevel: EVERYONE, MEMBER, MEMBER_PLUS, PARTNER, or ADMIN
 * - isResolved: true when Clerk + role API have both completed
 * - isAuthenticated: true if user is logged in
 * - isLoading: true while auth is being fetched
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isLoaded: isClerkLoaded } = useUser()
  const [accessLevel, setAccessLevel] = useState<AccessLevelType>(AccessLevel.EVERYONE)
  const [isRoleLoaded, setIsRoleLoaded] = useState(false)

  // Fetch role from API once Clerk is loaded
  useEffect(() => {
    if (!isClerkLoaded) return

    const fetchRole = async () => {
      try {
        // If no user, they're not authenticated
        if (!user) {
          setAccessLevel(AccessLevel.EVERYONE)
          setIsRoleLoaded(true)
          return
        }

        // Fetch actual role from Supabase via API
        const response = await fetch('/api/users/me')
        const data = await response.json()
        setAccessLevel((data.role as AccessLevelType) || AccessLevel.MEMBER)
      } catch (error) {
        console.error('Failed to fetch user role:', error)
        // Safe default: authenticated users get MEMBER
        setAccessLevel(user ? AccessLevel.MEMBER : AccessLevel.EVERYONE)
      } finally {
        setIsRoleLoaded(true)
      }
    }

    fetchRole()
  }, [user, isClerkLoaded])

  const value: AuthContextType = {
    accessLevel,
    isResolved: isClerkLoaded && isRoleLoaded,
    isAuthenticated: !!user,
    isLoading: !isClerkLoaded || !isRoleLoaded,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth - Access auth state from anywhere in the app
 *
 * @example
 * const { accessLevel, isResolved, isAuthenticated } = useAuth()
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
