'use client'

/**
 * StandardCanvas - Standardized Canvas wrapper with lifecycle management
 * 
 * Features:
 * - WebGL context loss/restore handling
 * - Automatic resource disposal
 * - Performance monitoring
 * - Device capability integration
 * - Frameloop control
 * - Route-based Canvas registry
 * 
 * @category three
 * @layer 2
 */

import React, { useEffect, useRef, useMemo, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import type { CanvasProps } from '@react-three/fiber'
import { contextManager } from '@/lib/threejs/context/contextManager'
import { canvasRegistry } from '@/lib/threejs/context/canvasRegistry'
import { detectDeviceCapabilities } from '@/lib/threejs/optimization/deviceCapability'
import type { DeviceCapabilities } from '@/lib/threejs/optimization/deviceCapability'

export interface StandardCanvasProps extends Omit<CanvasProps, 'onCreated' | 'performance'> {
  /**
   * Unique identifier for this Canvas instance
   * If not provided, will be auto-generated
   */
  id?: string

  /**
   * Route identifier for this Canvas
   * Used to enforce single Canvas per route
   */
  route?: string

  /**
   * Component name for debugging
   */
  componentName?: string

  /**
   * Frameloop control
   * - 'always': Render every frame (default for animations)
   * - 'demand': Only render when needed (better for static scenes)
   */
  frameloop?: 'always' | 'demand'

  /**
   * Performance preset
   * Automatically adjusts settings based on device capabilities
   */
  performance?: 'low' | 'medium' | 'high' | 'auto'

  /**
   * Callback when context is lost
   */
  onContextLost?: () => void

  /**
   * Callback when context is restored
   */
  onContextRestored?: () => void

  /**
   * Callback when Canvas is created
   */
  onCanvasCreated?: (state: ReturnType<typeof useThree>) => void

  /**
   * Enable performance monitoring
   */
  enableMonitoring?: boolean

  /**
   * Children to render inside the Canvas
   */
  children?: React.ReactNode
}

/**
 * Internal component to handle Canvas lifecycle
 */
function CanvasLifecycle({
  id,
  route,
  componentName,
  onContextLost,
  onContextRestored,
  onCanvasCreated,
  enableMonitoring,
}: {
  id: string
  route?: string
  componentName?: string
  onContextLost?: () => void
  onContextRestored?: () => void
  onCanvasCreated?: (state: ReturnType<typeof useThree>) => void
  enableMonitoring?: boolean
}) {
  const state = useThree()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Register Canvas on mount
  useEffect(() => {
    const canvas = state.gl.domElement as HTMLCanvasElement
    canvasRef.current = canvas

    // Register with context manager
    contextManager.registerContext(id, canvas)

    // Register with canvas registry
    if (route) {
      canvasRegistry.register(id, route, componentName)
    }

    // Subscribe to context state changes
    unsubscribeRef.current = contextManager.subscribe(id, (contextState) => {
      if (contextState === 'lost') {
        onContextLost?.()
      } else if (contextState === 'restored') {
        onContextRestored?.()
      }
    })

    // Call onCanvasCreated callback
    onCanvasCreated?.(state)

    // Performance monitoring
    if (enableMonitoring && process.env.NODE_ENV === 'development') {
      let frameCount = 0
      let lastTime = performance.now()

      const monitor = () => {
        frameCount++
        const now = performance.now()
        if (now - lastTime >= 1000) {
          const fps = frameCount / ((now - lastTime) / 1000)
          console.debug(`[StandardCanvas] ${id}: ${fps.toFixed(1)} FPS`)
          frameCount = 0
          lastTime = now
        }
        requestAnimationFrame(monitor)
      }
      monitor()
    }

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      canvasRegistry.unregister(id)
      contextManager.unregisterContext(id)
    }
  }, [
    id,
    route,
    componentName,
    state,
    onContextLost,
    onContextRestored,
    onCanvasCreated,
    enableMonitoring,
  ])

  return null
}

/**
 * StandardCanvas Component
 */
export function StandardCanvas({
  id: providedId,
  route,
  componentName,
  frameloop = 'always',
  performance: performancePreset = 'auto',
  onContextLost,
  onContextRestored,
  onCanvasCreated,
  enableMonitoring = process.env.NODE_ENV === 'development',
  children,
  ...canvasProps
}: StandardCanvasProps) {
  // Generate unique ID if not provided
  const id = useMemo(() => {
    return providedId || `canvas-${Math.random().toString(36).substring(2, 9)}`
  }, [providedId])

  // Get device capabilities for performance tuning
  const deviceCapabilities = useMemo(() => detectDeviceCapabilities(), [])

  // Determine performance settings
  const performanceSettings = useMemo(() => {
    if (performancePreset === 'auto') {
      if (deviceCapabilities.isLowEnd) return 'low'
      if (deviceCapabilities.isMobile) return 'medium'
      return 'high'
    }
    return performancePreset
  }, [performancePreset, deviceCapabilities])

  // Adjust Canvas props based on performance
  const optimizedProps = useMemo<CanvasProps>(() => {
    const baseProps: CanvasProps = {
      ...canvasProps,
      frameloop,
    }

    if (performanceSettings === 'low') {
      return {
        ...baseProps,
        dpr: Math.min(1, deviceCapabilities.devicePixelRatio),
        gl: {
          ...canvasProps.gl,
          antialias: false,
          powerPreference: 'low-power',
        },
      }
    }

    if (performanceSettings === 'medium') {
      return {
        ...baseProps,
        dpr: Math.min(1.5, deviceCapabilities.devicePixelRatio),
        gl: {
          ...canvasProps.gl,
          antialias: true,
          powerPreference: 'default',
        },
      }
    }

    // High performance
    return {
      ...baseProps,
      dpr: deviceCapabilities.devicePixelRatio,
      gl: {
        ...canvasProps.gl,
        antialias: true,
        powerPreference: 'high-performance',
      },
    }
  }, [performanceSettings, deviceCapabilities, frameloop, canvasProps])

  return (
    <Canvas {...optimizedProps}>
      <CanvasLifecycle
        id={id}
        route={route}
        componentName={componentName}
        onContextLost={onContextLost}
        onContextRestored={onContextRestored}
        onCanvasCreated={onCanvasCreated}
        enableMonitoring={enableMonitoring}
      />
      {children}
    </Canvas>
  )
}
