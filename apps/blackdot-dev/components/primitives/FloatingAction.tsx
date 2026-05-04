'use client'

import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * FloatingAction - Floating action button primitive
 *
 * A fixed-position floating action button with multiple variants and positions.
 * Captures the 8+ floating button instances across the codebase.
 *
 * @category composite
 * @layer 2
 * @example
 * ```tsx
 * <FloatingAction
 *   variant="primary"
 *   position="bottom-right"
 *   onClick={() => handleAction()}
 * >
 *   +
 * </FloatingAction>
 *
 * <FloatingAction
 *   variant="glass"
 *   position="bottom-center"
 * >
 *   Action
 * </FloatingAction>
 * ```
 */

const floatingActionVariants = cva(
  'fixed rounded-full font-semibold transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background shadow-lg backdrop-blur-sm',
  {
    variants: {
      variant: {
        primary: 'bg-primary/90 hover:bg-primary text-primary-foreground p-4',
        secondary:
          'bg-secondary/90 hover:bg-secondary text-secondary-foreground p-4',
        glass: 'glass-medium text-foreground p-4 hover:glass-light',
        'glass-primary':
          'bg-primary/10 backdrop-blur-lg border border-primary/30 text-primary hover:bg-primary/20 p-4',
        destructive:
          'bg-destructive/90 hover:bg-destructive text-white p-4 focus:ring-destructive/20',
      },
      size: {
        sm: 'w-10 h-10 text-sm',
        md: 'w-12 h-12 text-base',
        lg: 'w-14 h-14 text-lg',
        xl: 'w-16 h-16 text-xl',
      },
      position: {
        'top-left': 'top-6 left-6',
        'top-right': 'top-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'bottom-right': 'bottom-6 right-6',
        'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
        'top-center': 'top-6 left-1/2 -translate-x-1/2',
      },
      zIndex: {
        normal: 'z-40',
        high: 'z-50',
        highest: 'z-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      position: 'bottom-right',
      zIndex: 'high',
    },
  }
)

export interface FloatingActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof floatingActionVariants> {}

const FloatingAction = forwardRef<HTMLButtonElement, FloatingActionProps>(
  (
    {
      className,
      variant,
      size,
      position,
      zIndex,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      className={cn(
        floatingActionVariants({ variant, size, position, zIndex }),
        className
      )}
      {...props}
    >
      <span className="flex items-center justify-center">{children}</span>
    </button>
  )
)
FloatingAction.displayName = 'FloatingAction'

export { FloatingAction, floatingActionVariants }
