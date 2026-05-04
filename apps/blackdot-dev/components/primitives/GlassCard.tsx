'use client'

import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * GlassCard - Reusable glass-morphism card component
 *
 * A flexible card component with glass-morphism effects and multiple variants.
 * Captures the 23+ glass-morphism pattern instances across the codebase.
 *
 * @category composite
 * @layer 2
 * @example
 * ```tsx
 * <GlassCard variant="medium" padding="spacious">
 *   Your content here
 * </GlassCard>
 *
 * <GlassCard variant="primary" padding="compact">
 *   Featured content
 * </GlassCard>
 * ```
 */

const glassCardVariants = cva(
  'relative rounded-lg border transition-all',
  {
    variants: {
      variant: {
        light: 'glass-light',
        medium: 'glass-medium',
        strong: 'glass-strong',
        primary: 'bg-primary/10 backdrop-blur-xl border-primary/20',
        secondary: 'bg-secondary/10 backdrop-blur-xl border-secondary/20',
      },
      padding: {
        none: '',
        compact: 'p-4',
        comfortable: 'p-6',
        spacious: 'p-8',
      },
      shadow: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
        glass: 'shadow-[0_8px_32px_-2px_rgba(0,0,0,0.15)]',
      },
      interactive: {
        none: '',
        hover: 'hover:shadow-lg hover:scale-105',
        lift: 'hover:shadow-lg hover:-translate-y-1',
      },
    },
    defaultVariants: {
      variant: 'medium',
      padding: 'comfortable',
      shadow: 'glass',
      interactive: 'none',
    },
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, padding, shadow, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        glassCardVariants({ variant, padding, shadow, interactive }),
        className
      )}
      {...props}
    />
  )
)
GlassCard.displayName = 'GlassCard'

export { GlassCard, glassCardVariants }
