'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type NavigationVariant = 'full' | 'minimal' | 'hidden'

interface NavigationVisibilityContextValue {
  variant: NavigationVariant
  setVariant: (variant: NavigationVariant) => void
  isVisible: boolean
  setIsVisible: (visible: boolean) => void
  showBreadcrumbs: boolean
  setShowBreadcrumbs: (show: boolean) => void
}

const NavigationVisibilityContext = createContext<NavigationVisibilityContextValue | undefined>(
  undefined,
)

export function NavigationVisibilityProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<NavigationVariant>('full')
  const [isVisible, setIsVisible] = useState(true)
  const [showBreadcrumbs, setShowBreadcrumbs] = useState(true)

  const value: NavigationVisibilityContextValue = {
    variant,
    setVariant,
    isVisible,
    setIsVisible,
    showBreadcrumbs,
    setShowBreadcrumbs,
  }

  return (
    <NavigationVisibilityContext.Provider value={value}>
      {children}
    </NavigationVisibilityContext.Provider>
  )
}

export function useNavigationVisibility(): NavigationVisibilityContextValue {
  const context = useContext(NavigationVisibilityContext)
  if (context === undefined) {
    throw new Error(
      'useNavigationVisibility must be used within a NavigationVisibilityProvider',
    )
  }
  return context
}
