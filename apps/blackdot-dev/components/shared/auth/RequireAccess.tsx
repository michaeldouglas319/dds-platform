'use client'

import { useAuth } from '@/lib/contexts/AuthContext'
import { AccessLevelWeight, type AccessLevelType } from '@/lib/types/auth.types'

interface RequireAccessProps {
  level: AccessLevelType
  fallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * Component that conditionally renders children based on access level
 */
export function RequireAccess({ level, fallback = null, children }: RequireAccessProps) {
  const { accessLevel } = useAuth()
  const hasAccess = AccessLevelWeight[accessLevel] >= AccessLevelWeight[level]
  return hasAccess ? <>{children}</> : <>{fallback}</>
}
