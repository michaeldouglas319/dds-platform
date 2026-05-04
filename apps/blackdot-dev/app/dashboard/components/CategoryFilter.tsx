'use client'

/**
 * CategoryFilter Component
 *
 * Category tabs/filter buttons for filtering routes by category.
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ROUTE_CATEGORIES } from '@/lib/config/route-categories.config'

export interface CategoryFilterProps {
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
  className?: string
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  className,
}: CategoryFilterProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Button
        variant={selectedCategory === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onCategoryChange(null)}
      >
        All
      </Button>
      {ROUTE_CATEGORIES.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
        >
          {category.label}
        </Button>
      ))}
    </div>
  )
}
