'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  path: string
  icon?: LucideIcon
}

interface NavigationSectionProps {
  items: NavItem[]
  onNavigate?: (path: string) => void
}

/**
 * Theme-aware Navigation Section
 * Displays list of navigation items
 */
export function NavigationSection({
  items,
  onNavigate,
}: NavigationSectionProps) {
  return (
    <div className="sidebar-section">
      <div className="sidebar-section-label">Navigation</div>
      <div className="sidebar-section-content">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.path)}
              className="sidebar-nav-item"
            >
              {Icon && <Icon size={16} className="flex-shrink-0" />}
              <span className="flex-1 text-left text-sm">{item.label}</span>
              <div className="sidebar-nav-indicator" aria-hidden="true" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
