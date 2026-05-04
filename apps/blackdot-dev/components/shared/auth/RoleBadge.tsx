'use client'

import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/contexts/AuthContext'
import {
  AccessLevelLabels,
  AccessLevelColors,
} from '@/lib/types/auth.types'

/**
 * Displays current user's role as a badge
 */
export function RoleBadge() {
  const { accessLevel: role } = useAuth()

  return (
    <Badge variant={AccessLevelColors[role] as any}>
      {AccessLevelLabels[role]}
    </Badge>
  )
}
