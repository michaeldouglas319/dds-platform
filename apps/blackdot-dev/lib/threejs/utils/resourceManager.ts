/**
 * Resource Manager
 * 
 * Centralized resource disposal system with automatic cleanup and memory tracking.
 * Tracks all Three.js resources (geometries, materials, textures) and ensures
 * proper disposal order and memory leak detection.
 * 
 * Best Practices:
 * - Automatic disposal on component unmount
 * - Resource pool for reusable assets
 * - Memory leak detection
 * - Proper disposal order (textures → materials → geometries)
 */

import * as THREE from 'three'
import { useEffect, useRef } from 'react'

export interface ResourceStats {
  geometries: number
  materials: number
  textures: number
  total: number
  memoryEstimate: number // MB
}

export interface TrackedResource {
  id: string
  type: 'geometry' | 'material' | 'texture' | 'object3d'
  resource: THREE.BufferGeometry | THREE.Material | THREE.Texture | THREE.Object3D
  componentName?: string
  createdAt: number
  sizeEstimate?: number // bytes
}

class ResourceManager {
  private resources: Map<string, TrackedResource> = new Map()
  private componentResources: Map<string, Set<string>> = new Map() // componentId -> resourceIds
  private nextId = 0

  /**
   * Track a resource
   */
  track(
    resource: THREE.BufferGeometry | THREE.Material | THREE.Texture | THREE.Object3D,
    componentName?: string
  ): string {
    const id = `resource-${this.nextId++}`
    const type = this.getResourceType(resource)

    const tracked: TrackedResource = {
      id,
      type,
      resource,
      componentName,
      createdAt: Date.now(),
      sizeEstimate: this.estimateSize(resource),
    }

    this.resources.set(id, tracked)

    if (process.env.NODE_ENV === 'development') {
      console.debug(`[ResourceManager] Tracked ${type} ${id}`, {
        componentName,
        sizeEstimate: tracked.sizeEstimate,
      })
    }

    return id
  }

  /**
   * Track resources for a component
   */
  trackComponent(componentId: string, resourceIds: string[]): void {
    if (!this.componentResources.has(componentId)) {
      this.componentResources.set(componentId, new Set())
    }
    const set = this.componentResources.get(componentId)!
    resourceIds.forEach((id) => set.add(id))
  }

  /**
   * Dispose a single resource
   */
  dispose(id: string): void {
    const tracked = this.resources.get(id)
    if (!tracked) {
      return
    }

    try {
      this.disposeResource(tracked.resource, tracked.type)
      this.resources.delete(id)

      if (process.env.NODE_ENV === 'development') {
        console.debug(`[ResourceManager] Disposed ${tracked.type} ${id}`)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[ResourceManager] Failed to dispose ${tracked.type} ${id}:`, error)
      }
    }
  }

  /**
   * Dispose all resources for a component
   */
  disposeComponent(componentId: string): void {
    const resourceIds = this.componentResources.get(componentId)
    if (!resourceIds) {
      return
    }

    // Dispose in proper order: textures → materials → geometries
    const sortedIds = Array.from(resourceIds).sort((a, b) => {
      const resA = this.resources.get(a)
      const resB = this.resources.get(b)
      if (!resA || !resB) return 0

      const order = { texture: 0, material: 1, geometry: 2, object3d: 3 }
      return order[resA.type] - order[resB.type]
    })

    sortedIds.forEach((id) => this.dispose(id))
    this.componentResources.delete(componentId)

    if (process.env.NODE_ENV === 'development') {
      console.debug(`[ResourceManager] Disposed all resources for component ${componentId}`)
    }
  }

  /**
   * Dispose all resources
   */
  disposeAll(): void {
    const ids = Array.from(this.resources.keys())
    ids.forEach((id) => this.dispose(id))
    this.componentResources.clear()
  }

  /**
   * Get resource statistics
   */
  getStats(): ResourceStats {
    let geometries = 0
    let materials = 0
    let textures = 0
    let memoryEstimate = 0

    this.resources.forEach((tracked) => {
      if (tracked.type === 'geometry') geometries++
      else if (tracked.type === 'material') materials++
      else if (tracked.type === 'texture') textures++

      memoryEstimate += tracked.sizeEstimate || 0
    })

    return {
      geometries,
      materials,
      textures,
      total: this.resources.size,
      memoryEstimate: memoryEstimate / (1024 * 1024), // Convert to MB
    }
  }

  /**
   * Get resources for a component
   */
  getComponentResources(componentId: string): TrackedResource[] {
    const resourceIds = this.componentResources.get(componentId)
    if (!resourceIds) {
      return []
    }

    return Array.from(resourceIds)
      .map((id) => this.resources.get(id))
      .filter((r): r is TrackedResource => r !== undefined)
  }

  /**
   * Detect potential memory leaks
   */
  detectLeaks(): {
    hasLeaks: boolean
    orphanedResources: TrackedResource[]
    largeResources: TrackedResource[]
  } {
    const orphaned: TrackedResource[] = []
    const large: TrackedResource[] = []

    this.resources.forEach((tracked) => {
      // Check if resource is orphaned (no component tracking it)
      let isOrphaned = true
      this.componentResources.forEach((resourceIds) => {
        if (resourceIds.has(tracked.id)) {
          isOrphaned = false
        }
      })

      if (isOrphaned) {
        orphaned.push(tracked)
      }

      // Check for large resources (>10MB)
      if (tracked.sizeEstimate && tracked.sizeEstimate > 10 * 1024 * 1024) {
        large.push(tracked)
      }
    })

    return {
      hasLeaks: orphaned.length > 0 || large.length > 0,
      orphanedResources: orphaned,
      largeResources: large,
    }
  }

  /**
   * Get resource type
   */
  private getResourceType(
    resource: THREE.BufferGeometry | THREE.Material | THREE.Texture | THREE.Object3D
  ): TrackedResource['type'] {
    if (resource instanceof THREE.BufferGeometry) return 'geometry'
    if (resource instanceof THREE.Material) return 'material'
    if (resource instanceof THREE.Texture) return 'texture'
    if (resource instanceof THREE.Object3D) return 'object3d'
    throw new Error('Unknown resource type')
  }

  /**
   * Estimate resource size in bytes
   */
  private estimateSize(
    resource: THREE.BufferGeometry | THREE.Material | THREE.Texture | THREE.Object3D
  ): number {
    if (resource instanceof THREE.BufferGeometry) {
      let size = 0
      Object.values(resource.attributes).forEach((attr) => {
        if (attr instanceof THREE.BufferAttribute) {
          size += attr.count * attr.itemSize * 4 // Assume float32
        }
      })
      if (resource.index) {
        size += resource.index.count * 2 // Assume uint16
      }
      return size
    }

    if (resource instanceof THREE.Texture) {
      const width = (resource.image as any)?.width || 0
      const height = (resource.image as any)?.height || 0
      const channels = 4 // RGBA
      return width * height * channels
    }

    // Material and Object3D size estimation is complex, return 0
    return 0
  }

  /**
   * Dispose a resource based on type
   */
  private disposeResource(
    resource: THREE.BufferGeometry | THREE.Material | THREE.Texture | THREE.Object3D,
    type: TrackedResource['type']
  ): void {
    if (type === 'geometry' && resource instanceof THREE.BufferGeometry) {
      resource.dispose()
    } else if (type === 'material' && resource instanceof THREE.Material) {
      // Dispose textures first
      Object.keys(resource).forEach((key) => {
        const value = (resource as unknown as Record<string, unknown>)[key]
        if (value instanceof THREE.Texture) {
          value.dispose()
        }
      })
      resource.dispose()
    } else if (type === 'texture' && resource instanceof THREE.Texture) {
      resource.dispose()
    } else if (type === 'object3d' && resource instanceof THREE.Object3D) {
      resource.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            const materials = Array.isArray(child.material)
              ? child.material
              : [child.material]
            materials.forEach((mat) => {
              Object.keys(mat).forEach((key) => {
                const value = (mat as Record<string, unknown>)[key]
                if (value instanceof THREE.Texture) {
                  value.dispose()
                }
              })
              mat.dispose()
            })
          }
        }
      })
    }
  }
}

// Singleton instance
export const resourceManager = new ResourceManager()

/**
 * Hook to track and dispose resources automatically
 */
export function useResourceTracking(
  resources: (THREE.BufferGeometry | THREE.Material | THREE.Texture | THREE.Object3D | null | undefined)[],
  componentName?: string
): void {
  const componentIdRef = useRef<string>(`component-${Math.random().toString(36).substring(2, 9)}`)
  const trackedIdsRef = useRef<string[]>([])

  useEffect(() => {
    const trackedIds: string[] = []

    resources.forEach((resource) => {
      if (resource) {
        const id = resourceManager.track(resource, componentName)
        trackedIds.push(id)
      }
    })

    resourceManager.trackComponent(componentIdRef.current, trackedIds)
    trackedIdsRef.current = trackedIds

    return () => {
      resourceManager.disposeComponent(componentIdRef.current)
    }
  }, [componentName, ...resources])
}

/**
 * Hook to track a single resource
 */
export function useResource(
  resource: THREE.BufferGeometry | THREE.Material | THREE.Texture | THREE.Object3D | null | undefined,
  componentName?: string
): void {
  useResourceTracking(resource ? [resource] : [], componentName)
}
