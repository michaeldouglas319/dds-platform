'use client'

import { useMemo } from 'react'

/**
 * DurationBar - Reusable component for visualizing time duration
 *
 * Features:
 * - Calculates months/years from date range
 * - Configurable display format
 * - Animated progress bar
 * - Color customization
 * - Template-agnostic (works with any date range)
 * - Optional label and metadata display
 *
 * @category composite
 * @layer 2
 */

export interface DurationBarProps {
  startDate: Date | string
  endDate: Date | string
  color?: string
  showLabel?: boolean
  showDuration?: boolean
  format?: 'months' | 'years' | 'both'
  animate?: boolean
  className?: string
  metadata?: {
    label?: string
    icon?: React.ReactNode
  }
}

function parseDate(date: Date | string): Date {
  if (typeof date === 'string') {
    return new Date(date)
  }
  return date
}

function calculateDuration(start: Date, end: Date) {
  const startDate = parseDate(start)
  const endDate = parseDate(end)

  const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth())

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  return {
    totalMonths,
    years,
    months,
    isOngoing: new Date(endDate).getTime() > new Date().getTime()
  }
}

function formatDuration(totalMonths: number, format: 'months' | 'years' | 'both' = 'both'): string {
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  if (format === 'months') return `${totalMonths}m`
  if (format === 'years') return `${(totalMonths / 12).toFixed(1)}y`

  if (years > 0 && months > 0) {
    return `${years}y ${months}m`
  } else if (years > 0) {
    return `${years}y`
  } else {
    return `${months}m`
  }
}

export function DurationBar({
  startDate,
  endDate,
  color = '#64748b',
  showLabel = true,
  showDuration = true,
  format = 'both',
  animate = true,
  className = '',
  metadata
}: DurationBarProps) {
  const duration = useMemo(() => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate
    return calculateDuration(start, end)
  }, [startDate, endDate])

  const durationText = useMemo(() => {
    return formatDuration(duration.totalMonths, format)
  }, [duration.totalMonths, format])

  // Scale bar width: 0-12 months = 10%, 12-24 = 20%, 24+ = max
  const maxMonths = 48 // 4 years
  const barWidth = Math.min((duration.totalMonths / maxMonths) * 100, 100)

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && metadata?.label && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {metadata.icon && <span>{metadata.icon}</span>}
          <span>{metadata.label}</span>
        </div>
      )}

      <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${animate ? 'duration-1000 ease-out' : ''}`}
          style={{
            width: `${barWidth}%`,
            backgroundColor: color,
            opacity: duration.isOngoing ? 1 : 0.7
          }}
        />
      </div>

      {showDuration && (
        <div className="flex justify-between items-center text-xs text-slate-400">
          <span>{durationText}</span>
          {duration.isOngoing && (
            <span className="text-green-400 font-semibold">Ongoing</span>
          )}
        </div>
      )}
    </div>
  )
}
