'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageSection {
  id: string
  title: string
}

interface PageSidebarProps {
  currentSection?: number
  sections?: PageSection[]
  navigationLabel?: string
  onSectionClick?: (sectionId: string) => void
}

/**
 * PageSidebar Component
 * Renders page-level section navigation only
 * Global navigation is now handled by AppShell
 */
export function PageSidebar({
  currentSection,
  sections,
  navigationLabel,
  onSectionClick,
}: PageSidebarProps) {
  if (!sections || sections.length === 0) {
    return null
  }

  return (
    <nav
      className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3"
      aria-label="Page sections"
    >
      {navigationLabel && (
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-4 px-4">
          {navigationLabel}
        </div>
      )}

      {/* Page sections */}
      <div className="space-y-1">
        {sections.map((section, index) => {
          const isActive = currentSection === index + 1

          return (
            <button
              key={section.id}
              onClick={() => onSectionClick?.(section.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                isActive
                  ? 'bg-primary text-primary-foreground font-bold shadow-md'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full transition-all flex-shrink-0',
                  isActive ? 'bg-primary-foreground' : 'bg-muted-foreground/40 group-hover:bg-primary/60',
                )}
                aria-hidden="true"
              />
              <span className="flex-1 text-left truncate">{section.title}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
