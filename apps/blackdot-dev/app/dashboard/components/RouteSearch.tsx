'use client'

/**
 * RouteSearch Component
 *
 * Search input with debouncing for filtering routes.
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RouteSearchProps {
  onSearchChange: (query: string) => void
  placeholder?: string
  className?: string
}

export function RouteSearch({
  onSearchChange,
  placeholder = 'Search routes...',
  className,
}: RouteSearchProps) {
  const [query, setQuery] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, onSearchChange])

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9"
      />
    </div>
  )
}
