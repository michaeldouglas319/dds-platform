'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

/**
 * Skeleton - Loading placeholder that pulses to indicate content is loading.
 * Commonly used with Suspense boundaries when 3D scenes or heavy components are loading.
 * @example
 * <div className="space-y-4">
 *   <Skeleton className="h-12 w-12 rounded-full" />
 *   <Skeleton className="h-4 w-[250px]" />
 *   <Skeleton className="h-4 w-[200px]" />
 * </div>
 */
const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('animate-pulse rounded-md bg-muted', className)}
    {...props}
  />
));
Skeleton.displayName = 'Skeleton';

export { Skeleton };
export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;
