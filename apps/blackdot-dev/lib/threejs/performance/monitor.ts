/**
 * Performance Monitor
 * 
 * Performance monitoring system for Three.js scenes.
 * Tracks FPS, memory usage, draw calls, and context health.
 * 
 * Best Practices:
 * - FPS tracking
 * - Memory usage monitoring
 * - Draw call counting
 * - Context health metrics
 * - Performance budget alerts
 */

'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { contextManager } from '../context/contextManager'
import { resourceManager } from '../utils/resourceManager'
import { textureManager } from '../utils/textureManager'

export interface PerformanceMetrics {
  fps: number
  frameTime: number // ms
  drawCalls: number
  triangles: number
  points: number
  lines: number
  geometries: number
  textures: number
  programs: number
  memoryEstimate: number // MB
  contextHealth: {
    active: number
    lost: number
    total: number
    nearLimit: boolean
    atLimit: boolean
  }
}

export interface PerformanceMonitorOptions {
  /**
   * Update interval in milliseconds
   */
  interval?: number

  /**
   * Enable console logging
   */
  logToConsole?: boolean

  /**
   * Performance budget (warn if exceeded)
   */
  budget?: {
    maxDrawCalls?: number
    maxMemoryMB?: number
    minFPS?: number
  }

  /**
   * Callback when metrics update
   */
  onUpdate?: (metrics: PerformanceMetrics) => void
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    drawCalls: 0,
    triangles: 0,
    points: 0,
    lines: 0,
    geometries: 0,
    textures: 0,
    programs: 0,
    memoryEstimate: 0,
    contextHealth: {
      active: 0,
      lost: 0,
      total: 0,
      nearLimit: false,
      atLimit: false,
    },
  }

  private frameCount = 0
  private lastTime = performance.now()
  private lastFrameTime = performance.now()

  /**
   * Update metrics
   */
  update(gl: WebGLRenderingContext | WebGL2RenderingContext, info: {
    memory: {
      geometries: number
      textures: number
      programs: number
    }
    render: {
      frame: number
      calls: number
      triangles: number
      points: number
      lines: number
    }
  }): PerformanceMetrics {
    const now = performance.now()
    const delta = now - this.lastTime

    // Update FPS
    this.frameCount++
    if (delta >= 1000) {
      this.metrics.fps = Math.round((this.frameCount * 1000) / delta)
      this.frameCount = 0
      this.lastTime = now
    }

    // Update frame time
    this.metrics.frameTime = now - this.lastFrameTime
    this.lastFrameTime = now

    // Update render info
    this.metrics.drawCalls = info.render.calls
    this.metrics.triangles = info.render.triangles
    this.metrics.points = info.render.points
    this.metrics.lines = info.render.lines

    // Update memory info
    this.metrics.geometries = info.memory.geometries
    this.metrics.textures = info.memory.textures
    this.metrics.programs = info.memory.programs

    // Estimate memory
    const resourceStats = resourceManager.getStats()
    const textureStats = textureManager.getStats()
    this.metrics.memoryEstimate =
      resourceStats.memoryEstimate + textureStats.sizeMB

    // Update context health
    this.metrics.contextHealth = contextManager.getHealthStatus()

    return { ...this.metrics }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Check if performance budget is exceeded
   */
  checkBudget(budget: PerformanceMonitorOptions['budget']): {
    exceeded: boolean
    warnings: string[]
  } {
    const warnings: string[] = []

    if (budget?.maxDrawCalls && this.metrics.drawCalls > budget.maxDrawCalls) {
      warnings.push(
        `Draw calls (${this.metrics.drawCalls}) exceed budget (${budget.maxDrawCalls})`
      )
    }

    if (budget?.maxMemoryMB && this.metrics.memoryEstimate > budget.maxMemoryMB) {
      warnings.push(
        `Memory (${this.metrics.memoryEstimate.toFixed(2)}MB) exceeds budget (${budget.maxMemoryMB}MB)`
      )
    }

    if (budget?.minFPS && this.metrics.fps < budget.minFPS) {
      warnings.push(
        `FPS (${this.metrics.fps}) below budget (${budget.minFPS})`
      )
    }

    return {
      exceeded: warnings.length > 0,
      warnings,
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Hook to monitor performance
 * 
 * @example
 * ```tsx
 * function Scene() {
 *   usePerformanceMonitor({
 *     interval: 1000,
 *     logToConsole: true,
 *     budget: { minFPS: 30, maxDrawCalls: 100 }
 *   })
 *   return <mesh>...</mesh>
 * }
 * ```
 */
export function usePerformanceMonitor(
  options: PerformanceMonitorOptions = {}
): PerformanceMetrics {
  const {
    interval = 1000,
    logToConsole = process.env.NODE_ENV === 'development',
    budget,
    onUpdate,
  } = options

  const { gl } = useThree()
  const lastUpdateRef = useRef(0)

  useFrame(() => {
    const now = performance.now()
    if (now - lastUpdateRef.current >= interval) {
      const info = gl.info
      const metrics = performanceMonitor.update(gl as any, {
        memory: {
          geometries: info.memory.geometries,
          textures: info.memory.textures,
          programs: info.programs?.length || 0,
        },
        render: {
          frame: info.render.frame,
          calls: info.render.calls,
          triangles: info.render.triangles,
          points: info.render.points,
          lines: info.render.lines,
        },
      })

      // Check budget
      if (budget) {
        const budgetCheck = performanceMonitor.checkBudget(budget)
        if (budgetCheck.exceeded && logToConsole) {
          console.warn('[PerformanceMonitor] Budget exceeded:', budgetCheck.warnings)
        }
      }

      // Log to console
      if (logToConsole) {
        console.debug('[PerformanceMonitor]', {
          fps: metrics.fps,
          drawCalls: metrics.drawCalls,
          memory: `${metrics.memoryEstimate.toFixed(2)}MB`,
        })
      }

      // Callback
      onUpdate?.(metrics)

      lastUpdateRef.current = now
    }
  })

  return performanceMonitor.getMetrics()
}
