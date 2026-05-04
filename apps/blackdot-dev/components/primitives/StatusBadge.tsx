'use client'

import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * StatusBadge - Semantic role and status badges
 *
 * A flexible badge component for displaying user roles and status states.
 * Captures the 36+ color-coded badge pattern instances across the codebase.
 *
 * @category composite
 * @layer 2
 * @example
 * ```tsx
 * <StatusBadge role="admin">Admin</StatusBadge>
 * <StatusBadge status="success">Completed</StatusBadge>
 * <StatusBadge role="partner" size="lg">Partner</StatusBadge>
 * ```
 */

const statusBadgeVariants = cva(
  'inline-flex items-center gap-2 rounded-full font-semibold transition-all',
  {
    variants: {
      role: {
        member: 'badge-member',
        'member-plus': 'badge-member-plus',
        partner: 'badge-partner',
        admin: 'badge-admin',
      },
      status: {
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        info: 'badge-info',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
      },
      variant: {
        solid: 'font-bold',
        outline: 'border border-current',
        subtle: 'opacity-75',
      },
      interactive: {
        none: '',
        hover: 'hover:shadow-md hover:scale-105 cursor-pointer',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'solid',
      interactive: 'none',
    },
  }
)

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'role'>,
    VariantProps<typeof statusBadgeVariants> {
  icon?: React.ReactNode
  asChild?: boolean
}

const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      className,
      role,
      status,
      size,
      variant: variantProp,
      interactive,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    // Ensure only one of role or status is used
    const variant = role ? undefined : status ? undefined : variantProp

    return (
      <span
        ref={ref}
        className={cn(
          statusBadgeVariants({
            role: role as 'member' | 'partner' | 'admin' | 'member-plus' | undefined,
            status,
            size,
            variant: variantProp,
            interactive,
          }),
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
      </span>
    )
  }
)
StatusBadge.displayName = 'StatusBadge'

export { StatusBadge, statusBadgeVariants }
