'use client'

/**
 * ThreeUI - Shadcn + R3F Integration Layer
 * 
 * Bridge between shadcn UI components and 3D scenes.
 * Provides HTML overlays, UI controls, and responsive layouts.
 * 
 * @category three
 * @layer 2
 */

import React from 'react'
import { Html } from '@react-three/drei'
import { cn } from '@/lib/utils'

export interface ThreeUIProps {
  /**
   * Shadcn UI component to render in 3D space
   */
  children: React.ReactNode

  /**
   * Position in 3D space
   */
  position?: [number, number, number]

  /**
   * Transform origin
   */
  transform?: boolean

  /**
   * Distance factor (how much to scale based on camera distance)
   */
  distanceFactor?: number

  /**
   * Center the HTML element
   */
  center?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Z-index offset
   */
  zIndexRange?: [number, number]

  /**
   * Sprite mode (billboard)
   */
  sprite?: boolean

  /**
   * Occlude (hide when behind objects)
   */
  occlude?: boolean
}

/**
 * ThreeUI Component
 * Renders shadcn UI components in 3D space
 * 
 * @example
 * ```tsx
 * <ThreeUI position={[0, 2, 0]}>
 *   <Button>Click me</Button>
 * </ThreeUI>
 * ```
 */
export function ThreeUI({
  children,
  position,
  transform = true,
  distanceFactor = 1,
  center = true,
  className,
  zIndexRange,
  sprite = false,
  occlude = false,
  ...htmlProps
}: ThreeUIProps) {
  return (
    <Html
      position={position}
      transform={transform}
      distanceFactor={distanceFactor}
      center={center}
      zIndexRange={zIndexRange}
      sprite={sprite}
      occlude={occlude}
      {...htmlProps}
    >
      <div className={cn('three-ui-container', className)}>{children}</div>
    </Html>
  )
}

/**
 * ThreeUI Panel
 * Fixed position panel overlay on top of 3D scene
 * 
 * @example
 * ```tsx
 * <ThreeUIPanel position="top-right">
 *   <Card>
 *     <CardHeader>Controls</CardHeader>
 *     <CardContent>...</CardContent>
 *   </Card>
 * </ThreeUIPanel>
 * ```
 */
export function ThreeUIPanel({
  position = 'top-right',
  children,
  className,
}: {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'
  children: React.ReactNode
  className?: string
}) {
  const positionClasses = {
    'top-left': 'fixed top-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'top-center': 'fixed top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'fixed bottom-4 left-1/2 -translate-x-1/2',
  }

  return (
    <div className={cn('z-50', positionClasses[position], className)}>{children}</div>
  )
}

/**
 * ThreeUI Overlay
 * Full-screen overlay for UI on top of 3D scene
 * 
 * @example
 * ```tsx
 * <ThreeUIOverlay>
 *   <Dialog>...</Dialog>
 * </ThreeUIOverlay>
 * ```
 */
export function ThreeUIOverlay({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('fixed inset-0 z-50 pointer-events-none', className)}>
      <div className="pointer-events-auto">{children}</div>
    </div>
  )
}
