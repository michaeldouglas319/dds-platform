'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface UnreadBadgeProps {
  count: number
  className?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

/**
 * Unread message counter badge
 */
export function UnreadBadge({
  count,
  className,
  variant = 'destructive',
}: UnreadBadgeProps) {
  if (count === 0) return null

  const displayCount = count > 99 ? '99+' : count.toString()

  return (
    <Badge
      variant={variant}
      className={cn('ml-auto text-xs font-bold', className)}
    >
      {displayCount}
    </Badge>
  )
}
