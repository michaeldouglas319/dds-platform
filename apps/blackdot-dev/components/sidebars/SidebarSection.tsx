'use client'

import React, { ReactNode } from 'react'

interface SidebarSectionProps {
  label: string
  children: ReactNode
  className?: string
}

/**
 * Theme-aware Sidebar Section
 * Container for grouped sidebar content with label
 */
export function SidebarSection({ label, children, className = '' }: SidebarSectionProps) {
  return (
    <div className={`sidebar-section ${className}`}>
      <div className="sidebar-section-label">{label}</div>
      <div className="sidebar-section-content">{children}</div>
    </div>
  )
}
