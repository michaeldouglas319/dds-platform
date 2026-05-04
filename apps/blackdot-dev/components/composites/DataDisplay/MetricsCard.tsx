'use client'

import { ReactNode, useMemo } from 'react'

/**
 * MetricsCard - Reusable component for displaying metrics and achievements
 *
 * Features:
 * - Template-based metric extraction from text
 * - Multiple layout options (grid, list, stacked)
 * - Automatic pattern matching (%, numbers, +/- indicators)
 * - Color customization per metric
 * - Animation support
 * - Badge/highlight styling options
 * - Nestable with other components
 *
 * @category composite
 * @layer 2
 */

export interface Metric {
  value: string | number
  label: string
  icon?: ReactNode
  color?: string
  unit?: string
}

export interface MetricsCardProps {
  metrics?: Metric[]
  content?: string // Extract metrics from text
  layout?: 'grid' | 'list' | 'stacked'
  columns?: number
  maxMetrics?: number
  backgroundColor?: string
  textColor?: string
  borderColor?: string
  className?: string
  showBorder?: boolean
  animate?: boolean
  size?: 'sm' | 'md' | 'lg'
}

// Pattern matching for automatic metric extraction
const metricPatterns = [
  { regex: /(\d+)%/g, format: (match: string) => ({ value: match, unit: 'percent' }) },
  { regex: /(\d+)\+/g, format: (match: string) => ({ value: match, unit: 'plus' }) },
  { regex: /(\d+)[xX]/g, format: (match: string) => ({ value: match.toLowerCase(), unit: 'multiplier' }) }
]

function extractMetrics(content: string): Metric[] {
  const extracted: Metric[] = []
  const seen = new Set<string>()

  metricPatterns.forEach(({ regex }) => {
    let match
    while ((match = regex.exec(content)) !== null) {
      const fullMatch = match[0]
      if (!seen.has(fullMatch)) {
        seen.add(fullMatch)
        extracted.push({
          value: fullMatch,
          label: `Metric: ${fullMatch}`,
          color: '#10b981' // Default green for metrics
        })
      }
    }
  })

  return extracted
}

const sizeMap = {
  sm: {
    value: 'text-lg',
    label: 'text-xs',
    padding: 'px-2 py-1'
  },
  md: {
    value: 'text-2xl',
    label: 'text-sm',
    padding: 'px-3 py-2'
  },
  lg: {
    value: 'text-3xl',
    label: 'text-base',
    padding: 'px-4 py-3'
  }
}

export function MetricsCard({
  metrics,
  content,
  layout = 'grid',
  columns = 2,
  maxMetrics,
  backgroundColor = 'bg-slate-800/50',
  textColor = 'text-slate-100',
  borderColor = 'border-slate-700',
  className = '',
  showBorder = true,
  animate = true,
  size = 'md'
}: MetricsCardProps) {
  const displayMetrics = useMemo(() => {
    let items = metrics || []

    // Extract metrics from content if no metrics provided
    if (!items.length && content) {
      items = extractMetrics(content)
    }

    return maxMetrics ? items.slice(0, maxMetrics) : items
  }, [metrics, content, maxMetrics])

  if (!displayMetrics.length) {
    return null
  }

  const layoutClasses = {
    grid: `grid gap-3 ${columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`,
    list: 'flex flex-col gap-3',
    stacked: 'flex gap-1 flex-wrap'
  }

  const sizes = sizeMap[size]

  return (
    <div
      className={`${backgroundColor} ${showBorder ? `border ${borderColor}` : ''} rounded-lg p-4 ${className}`}
    >
      <div className={layoutClasses[layout]}>
        {displayMetrics.map((metric, index) => (
          <div
            key={`${metric.label}-${index}`}
            className={`${sizes.padding} rounded-md ${animate ? 'transition-all duration-300 hover:scale-105' : ''}`}
            style={{
              backgroundColor: metric.color ? `${metric.color}20` : 'transparent',
              borderLeft: metric.color ? `3px solid ${metric.color}` : 'none'
            }}
          >
            {metric.icon && (
              <div className="mb-1">{metric.icon}</div>
            )}
            <div className={`${sizes.value} font-bold`} style={{ color: metric.color || 'currentColor' }}>
              {metric.value}
              {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
            </div>
            <div className={`${sizes.label} text-slate-400 mt-1`}>
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {maxMetrics && displayMetrics.length < (metrics?.length || 0) && (
        <div className="mt-3 text-xs text-slate-500 italic">
          +{(metrics?.length || 0) - displayMetrics.length} more metrics
        </div>
      )}
    </div>
  )
}
