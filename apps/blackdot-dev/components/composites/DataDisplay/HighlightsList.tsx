'use client'

import { useMemo } from 'react'

/**
 * HighlightsList - Reusable component for displaying highlights/features
 *
 * Features:
 * - Configurable layout (inline, wrapped, grid)
 * - Dynamic column count based on item count
 * - Color customization per item or global
 * - Responsive text sizing
 * - Template-agnostic (works with any data)
 *
 * @category composite
 * @layer 2
 */

export interface HighlightsListProps {
  items: string[]
  color?: string
  layout?: 'inline' | 'wrapped' | 'grid'
  maxColumns?: number
  maxItems?: number
  truncate?: boolean
  textSize?: 'xs' | 'sm' | 'base' | 'lg'
  bullet?: boolean
  separator?: string
  className?: string
}

const textSizeMap = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg'
}

export function HighlightsList({
  items = [],
  color = '#64748b',
  layout = 'wrapped',
  maxColumns = 2,
  maxItems,
  truncate = true,
  textSize = 'xs',
  bullet = true,
  separator = '•',
  className = ''
}: HighlightsListProps) {
  const displayItems = useMemo(() => {
    return maxItems ? items.slice(0, maxItems) : items
  }, [items, maxItems])

  const layoutClasses = {
    inline: 'flex flex-wrap gap-2',
    wrapped: 'flex flex-col gap-2',
    grid: `grid gap-2 ${maxColumns === 1 ? 'grid-cols-1' : maxColumns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`
  }

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {displayItems.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className={`${textSizeMap[textSize]} text-slate-300 ${truncate ? 'truncate' : 'line-clamp-2'}`}
          style={{ color }}
        >
          {bullet && <span className="mr-2">{separator}</span>}
          <span>{item}</span>
        </div>
      ))}

      {truncate && maxItems && items.length > maxItems && (
        <div className={`${textSizeMap[textSize]} text-slate-400 italic`}>
          +{items.length - maxItems} more
        </div>
      )}
    </div>
  )
}
