'use client'

/**
 * Reusable Feature Gate Wrapper Component
 *
 * Wraps components to conditionally render based on user access level.
 * Defaults to ADMIN access level.
 *
 * Usage:
 * ```typescript
 * // Admin-only (default)
 * <FeatureGated>
 *   <AdminPanel />
 * </FeatureGated>
 *
 * // Premium-only
 * <FeatureGated requiredLevel={AccessLevel.MEMBER_PLUS}>
 *   <PremiumFeature />
 * </FeatureGated>
 *
 * // Member-only
 * <FeatureGated requiredLevel={AccessLevel.MEMBER}>
 *   <MemberContent />
 * </FeatureGated>
 * ```
 */

import { ReactNode, ReactElement } from 'react'
import { AccessLevel, AccessLevelWeight, type AccessLevelType } from '@/lib/types/auth.types'
import { useAuth } from '@/lib/contexts/AuthContext'

interface FeatureGatedProps {
  /** Minimum access level required to view this component (defaults to ADMIN) */
  requiredLevel?: AccessLevelType
  /** The content to display if access is granted */
  children: ReactNode
  /** Optional fallback to display if access is denied */
  fallback?: ReactNode | ReactElement | string
  /** Optional CSS class for the wrapper div */
  className?: string
}

/**
 * Feature-gated component wrapper
 *
 * @param requiredLevel - Minimum access level required (default: ADMIN)
 * @param children - Content to render if user has access
 * @param fallback - Optional content to show if user lacks access (default: null)
 * @param className - Optional CSS class for wrapper div
 *
 * @example
 * // Admin-only (simplest usage)
 * <FeatureGated>
 *   <DebugTools />
 * </FeatureGated>
 *
 * @example
 * // Premium-only with fallback
 * <FeatureGated requiredLevel={AccessLevel.MEMBER_PLUS} fallback={<UpgradePrompt />}>
 *   <PremiumFeature />
 * </FeatureGated>
 */
export function FeatureGated({
  requiredLevel = AccessLevel.ADMIN,
  children,
  fallback = null,
  className,
}: FeatureGatedProps) {
  const { accessLevel } = useAuth()
  const isEnabled = AccessLevelWeight[accessLevel] >= AccessLevelWeight[requiredLevel]

  if (!isEnabled) {
    return fallback ? <div className={className}>{fallback}</div> : null
  }

  return className ? <div className={className}>{children}</div> : <>{children}</>
}

export default FeatureGated
