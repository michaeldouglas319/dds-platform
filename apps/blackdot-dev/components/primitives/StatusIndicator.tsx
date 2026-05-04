'use client'

import React from 'react'
import { GlassCard } from '@/components/primitives'
import { cn } from '@/lib/utils'

interface StatusIndicatorProps {
  /** Current status */
  status: 'online' | 'offline' | 'loading' | 'error'
  /** Optional label */
  label?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Custom className */
  className?: string
}

/**
 * StatusIndicator - Shows connection or system status
 *
 * @category ui
 * @layer 2
 */
export function StatusIndicator({
  status,
  label,
  size = 'md',
  className
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    loading: 'bg-yellow-500 animate-pulse',
    error: 'bg-red-500'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-full',
          sizeClasses[size],
          statusClasses[status]
        )}
      />
      {label && (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {label}
        </span>
      )}
    </div>
  )
}
