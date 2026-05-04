'use client'

import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * NavHeader - Navigation header primitive
 *
 * A flexible navigation header component with glass-morphism and floating variants.
 * Captures the 12+ navigation header instances across the codebase.
 *
 * @category composite
 * @layer 2
 * @example
 * ```tsx
 * <NavHeader variant="glass">
 *   <span>Navigation</span>
 * </NavHeader>
 *
 * <NavHeader variant="floating" sticky>
 *   Your header content
 * </NavHeader>
 * ```
 */

const navHeaderVariants = cva(
  'flex items-center justify-between transition-all border-b',
  {
    variants: {
      variant: {
        solid: 'bg-background border-border',
        glass: 'bg-background/50 backdrop-blur-xl border-white/10 dark:border-white/5',
        'glass-strong':
          'bg-background/60 backdrop-blur-2xl border-white/15 dark:border-white/8',
        floating:
          'bg-background/60 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-lg rounded-lg',
      },
      padding: {
        none: '',
        compact: 'px-4 py-2',
        standard: 'px-6 py-3',
        spacious: 'px-8 py-4',
      },
      sticky: {
        true: 'sticky top-0 z-40',
        false: 'relative',
      },
      elevated: {
        true: 'shadow-lg',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'glass',
      padding: 'standard',
      sticky: false,
      elevated: false,
    },
  }
)

export interface NavHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof navHeaderVariants> {
  logo?: React.ReactNode
  actions?: React.ReactNode
}

const NavHeader = forwardRef<HTMLDivElement, NavHeaderProps>(
  (
    {
      className,
      variant,
      padding,
      sticky,
      elevated,
      logo,
      actions,
      children,
      ...props
    },
    ref
  ) => (
    <header
      ref={ref}
      className={cn(
        navHeaderVariants({ variant, padding, sticky, elevated }),
        className
      )}
      {...props}
    >
      {logo && <div className="flex-shrink-0">{logo}</div>}

      {children && (
        <div className="flex-1 flex items-center justify-center px-4">
          {children}
        </div>
      )}

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
)
NavHeader.displayName = 'NavHeader'

export { NavHeader, navHeaderVariants }
