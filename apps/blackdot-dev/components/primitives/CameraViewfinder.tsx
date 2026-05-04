'use client'

import React, { forwardRef, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * CameraViewfinder - Minimal camera overlay wrapper
 *
 * Wraps any component in a camera viewfinder UI with metadata display.
 * Useful for showcasing 3D models, product views, or any focal content.
 *
 * @category primitive
 * @layer 2
 * @example
 * ```tsx
 * <CameraViewfinder
 *   fps={60}
 *   iso="100"
 *   aperture="F3.5"
 * >
 *   <YourModelComponent />
 * </CameraViewfinder>
 * ```
 */

const viewfinderVariants = cva(
  'relative w-full aspect-video bg-slate-900 overflow-hidden',
  {
    variants: {
      variant: {
        default: '',
        compact: 'aspect-square',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface CameraViewfinderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>,
    'children'>,
    VariantProps<typeof viewfinderVariants> {
  children: ReactNode
  fps?: number
  resolution?: string
  iso?: string
  aperture?: string
  focalLength?: string
  recording?: boolean
  showCorners?: boolean
}

const CameraViewfinder = forwardRef<HTMLDivElement, CameraViewfinderProps>(
  ({
    className,
    variant,
    fps = 60,
    resolution = 'HD',
    iso = '100',
    aperture = 'F3.5',
    focalLength,
    recording = true,
    showCorners = true,
    children,
    ...props
  }, ref) => (
    <div
      ref={ref}
      className={cn(viewfinderVariants({ variant }), className)}
      {...props}
    >
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>

      {/* Recording Indicator - Top Left */}
      {recording && (
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-slate-950/60 backdrop-blur px-3 py-2 rounded">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">REC</span>
          <span className="text-xs font-mono text-gray-300">00:00:00</span>
        </div>
      )}

      {/* Resolution - Top Right */}
      <div className="absolute top-6 right-6 z-10 flex gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
        <span>FPS {fps}</span>
        <span>{resolution}</span>
        <span>4K</span>
      </div>

      {/* Camera Settings - Bottom Left */}
      <div className="absolute bottom-6 left-6 z-10 flex gap-8 text-xs font-semibold text-gray-300 uppercase tracking-wider">
        <span>ISO{iso}</span>
        <span>{aperture}</span>
        {focalLength && <span>{focalLength}</span>}
      </div>

      {/* Corner Brackets */}
      {showCorners && (
        <>
          {/* Top-left corner */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white pointer-events-none" />
          {/* Top-right corner */}
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white pointer-events-none" />
          {/* Bottom-left corner */}
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white pointer-events-none" />
          {/* Bottom-right corner */}
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white pointer-events-none" />
        </>
      )}
    </div>
  )
)
CameraViewfinder.displayName = 'CameraViewfinder'

export { CameraViewfinder, viewfinderVariants }
