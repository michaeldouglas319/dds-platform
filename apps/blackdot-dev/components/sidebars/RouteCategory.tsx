'use client'

import React, { ReactNode } from 'react'

interface RouteCategoryProps {
  title: string
  children: ReactNode
}

/**
 * Theme-aware Route Category
 * Container for grouping routes by category
 */
export function RouteCategory({ title, children }: RouteCategoryProps) {
  return (
    <div className="sidebar-section">
      <div className="sidebar-section-label">{title}</div>
      <div className="sidebar-section-content">{children}</div>
    </div>
  )
}
