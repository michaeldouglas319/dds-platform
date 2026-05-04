'use client'

import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * InteractiveCard - Interactive card component with hover/click states
 *
 * A flexible card component with predefined interactive behaviors.
 * Captures the 20+ interactive card pattern instances across the codebase.
 *
 * @category composite
 * @layer 2
 * @example
 * ```tsx
 * <InteractiveCard variant="scale" accentColor="#3b82f6">
 *   Clickable content
 * </InteractiveCard>
 *
 * <InteractiveCard variant="lift" className="cursor-pointer">
 *   Hover to lift effect
 * </InteractiveCard>
 * ```
 */

const interactiveCardVariants = cva(
  'relative rounded-lg border transition-all cursor-pointer group',
  {
    variants: {
      variant: {
        scale: 'hover:scale-105 active:scale-95 shadow-md hover:shadow-lg',
        lift: 'hover:shadow-lg hover:-translate-y-1 active:translate-y-0',
        subtle: 'hover:opacity-90 active:opacity-95',
        glow: 'hover:shadow-xl dark:hover:shadow-2xl active:shadow-lg',
      },
      glass: {
        true: 'glass-medium',
        false: 'bg-card/50 border-border',
      },
      accentOnHover: {
        true: 'hover:border-primary/50',
        false: '',
      },
      padding: {
        none: '',
        compact: 'p-4',
        comfortable: 'p-6',
        spacious: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'scale',
      glass: false,
      accentOnHover: false,
      padding: 'comfortable',
    },
  }
)

export interface InteractiveCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof interactiveCardVariants> {
  accentColor?: string
}

const InteractiveCard = forwardRef<HTMLDivElement, InteractiveCardProps>(
  (
    {
      className,
      variant,
      glass,
      accentOnHover,
      padding,
      accentColor,
      style,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        interactiveCardVariants({ variant, glass, accentOnHover, padding }),
        className
      )}
      style={
        accentColor
          ? {
              ...style,
              '--card-accent': accentColor,
            } as React.CSSProperties
          : style
      }
      {...props}
    />
  )
)
InteractiveCard.displayName = 'InteractiveCard'

export { InteractiveCard, interactiveCardVariants }
