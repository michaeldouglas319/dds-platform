'use client'

import React, { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SidebarOrientation = 'left' | 'right' | 'top' | 'bottom'
type SidebarVariant = 'full' | 'minimal' | 'hidden'
type SidebarSize = 'sm' | 'md' | 'lg' | 'xl'

interface SidebarLayoutProps {
  profile?: ReactNode
  navigation?: ReactNode
  explore?: ReactNode
  footer?: ReactNode

  // Orientation configuration
  orientation?: SidebarOrientation

  // Visibility configuration
  variant?: SidebarVariant

  // Size configuration
  size?: SidebarSize

  // Styling options
  showScanlineEffect?: boolean
  showBackdrop?: boolean
  backdropOpacity?: 'low' | 'medium' | 'high'

  // Layout options
  isSticky?: boolean
  isFixed?: boolean

  // Responsive options
  hideOnMobile?: boolean
  collapseAt?: 'sm' | 'md' | 'lg' | 'xl' | 'none'

  // Custom styling
  className?: string
  contentClassName?: string
}

/**
 * Theme-aware Sidebar Layout
 * Fully configurable sidebar component with support for orientation, size, visibility, and responsiveness
 * Isolated from global navigation - can be used independently on any page
 *
 * @example
 * ```tsx
 * <SidebarLayout
 *   orientation="left"
 *   size="md"
 *   variant="full"
 *   profile={<ProfileSection ... />}
 *   navigation={<NavigationSection ... />}
 *   footer={<ThemeToggle />}
 * />
 * ```
 */
export function SidebarLayout({
  profile,
  navigation,
  explore,
  footer,
  orientation = 'left',
  variant = 'full',
  size = 'md',
  showScanlineEffect = true,
  showBackdrop = true,
  backdropOpacity = 'medium',
  isSticky = false,
  isFixed = false,
  hideOnMobile = false,
  collapseAt = 'md',
  className,
  contentClassName,
}: SidebarLayoutProps) {
  // Size configuration
  const sizeClasses = {
    sm: 'w-48 md:w-52',    // 192px / 208px
    md: 'w-60 md:w-72',    // 240px / 288px
    lg: 'w-72 md:w-80',    // 288px / 320px
    xl: 'w-80 md:w-96',    // 320px / 384px
  }[size]

  // Orientation-based layout (flex direction and border)
  const orientationLayoutClasses = {
    left: 'flex-col border-r',
    right: 'flex-col border-l',
    top: 'flex-row border-b',
    bottom: 'flex-row border-t',
  }[orientation]

  // Orientation-based positioning (only applied when fixed/sticky)
  const orientationPositionClasses = (isFixed || isSticky)
    ? {
        left: 'inset-y-0 left-0',
        right: 'inset-y-0 right-0',
        top: 'inset-x-0 top-0',
        bottom: 'inset-x-0 bottom-0',
      }[orientation]
    : ''

  // Visibility configuration
  const visibilityClasses = {
    full: 'block',
    minimal: 'hidden md:block',
    hidden: 'hidden',
  }[variant]

  // Position configuration
  const positionClasses = isFixed ? 'fixed' : isSticky ? 'sticky' : ''

  // Responsive hide configuration
  const responsiveClasses = hideOnMobile ? 'hidden md:flex' : ''

  // Backdrop opacity configuration
  const backdropClasses = showBackdrop
    ? {
        low: 'bg-background/40',
        medium: 'bg-background/60',
        high: 'bg-background/80',
      }[backdropOpacity]
    : ''

  return (
    <aside
      className={cn(
        'sidebar',
        'flex',
        orientationLayoutClasses,
        sizeClasses,
        positionClasses,
        orientationPositionClasses,
        visibilityClasses,
        responsiveClasses,
        backdropClasses || 'bg-background/60',
        'backdrop-blur-3xl border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.3)]',
        'transition-all duration-300 ease-out',
        'overflow-hidden',
        className
      )}
      role="complementary"
      aria-label="Sidebar navigation"
    >
      <div
        className={cn(
          'flex h-full relative overflow-hidden',
          orientation === 'left' || orientation === 'right' ? 'flex-col' : 'flex-row',
          contentClassName
        )}
      >
        {/* HUD scanline effect - reduced opacity for better performance */}
        {showScanlineEffect && (
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
        )}

        {/* Profile Section */}
        {profile && (
          <div className="relative z-10 flex-shrink-0">
            {profile}
          </div>
        )}

        {/* Navigation Section */}
        {navigation && (
          <div className={cn(
            'relative z-10',
            orientation === 'left' || orientation === 'right'
              ? 'flex-1 overflow-y-auto'
              : 'flex-1 overflow-x-auto'
          )}>
            {navigation}
          </div>
        )}

        {/* Explore Section */}
        {explore && (
          <div className="relative z-10 flex-shrink-0">
            {explore}
          </div>
        )}

        {/* Footer Section */}
        {footer && (
          <div className="sidebar-footer relative z-10 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </aside>
  )
}

export type { SidebarLayoutProps, SidebarOrientation, SidebarVariant, SidebarSize }
