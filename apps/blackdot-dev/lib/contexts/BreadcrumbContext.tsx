'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { getBreadcrumbPath } from '@/lib/config/navigation'

export interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbContextValue {
  breadcrumbs: BreadcrumbItem[]
  setBreadcrumbs: (items: BreadcrumbItem[]) => void
  addBreadcrumb: (item: BreadcrumbItem) => void
  clearBreadcrumbs: () => void
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(undefined)

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { label: 'Home', href: '/' },
  ])

  const addBreadcrumb = (item: BreadcrumbItem) => {
    setBreadcrumbs((prev) => [...prev, item])
  }

  const clearBreadcrumbs = () => {
    setBreadcrumbs([{ label: 'Home', href: '/' }])
  }

  const value: BreadcrumbContextValue = {
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    clearBreadcrumbs,
  }

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>
}

export function useBreadcrumb(): BreadcrumbContextValue {
  const context = useContext(BreadcrumbContext)
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider')
  }
  return context
}

/**
 * Hook to automatically set breadcrumbs based on the current pathname
 * Call this in page components to auto-populate breadcrumbs
 */
export function usePathnameBreadcrumbs() {
  const pathname = usePathname()
  const { setBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    const breadcrumbs = getBreadcrumbPath(pathname)
    setBreadcrumbs(breadcrumbs)
  }, [pathname, setBreadcrumbs])
}
