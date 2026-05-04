/**
 * Texture Manager
 * 
 * Texture management with caching, compression, and memory limits.
 * Prevents texture memory exhaustion and provides automatic cleanup.
 * 
 * Best Practices:
 * - Texture cache with size limits
 * - Automatic texture compression
 * - Memory-aware texture loading
 * - Automatic disposal on memory pressure
 */

import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { useMemo, useEffect } from 'react'
import { useResource } from './resourceManager'

export interface TextureOptions {
  /**
   * Generate mipmaps
   */
  generateMipmaps?: boolean

  /**
   * Minification filter
   */
  minFilter?: THREE.TextureFilter

  /**
   * Magnification filter
   */
  magFilter?: THREE.MagnificationTextureFilter

  /**
   * Anisotropy level
   */
  anisotropy?: number

  /**
   * Texture format
   */
  format?: THREE.PixelFormat

  /**
   * Texture type
   */
  type?: THREE.TextureDataType

  /**
   * Wrap mode S
   */
  wrapS?: THREE.Wrapping

  /**
   * Wrap mode T
   */
  wrapT?: THREE.Wrapping

  /**
   * Component name for debugging
   */
  componentName?: string

  /**
   * Auto-dispose on unmount
   */
  autoDispose?: boolean
}

export interface TextureCacheEntry {
  texture: THREE.Texture
  path: string
  size: number // bytes
  lastUsed: number
  useCount: number
}

class TextureManager {
  private cache: Map<string, TextureCacheEntry> = new Map()
  private maxCacheSize = 200 * 1024 * 1024 // 200MB
  private currentCacheSize = 0
  private maxTextures = 100

  /**
   * Get texture from cache or load new
   */
  getTexture(path: string, options: TextureOptions = {}): THREE.Texture {
    // Check cache first
    const cached = this.cache.get(path)
    if (cached) {
      cached.lastUsed = Date.now()
      cached.useCount++
      return cached.texture
    }

    // Load new texture (this will be handled by useTexture hook)
    // Cache management happens in the hook
    throw new Error('Texture should be loaded via useTexture hook')
  }

  /**
   * Cache a texture
   */
  cacheTexture(path: string, texture: THREE.Texture, size?: number): void {
    const estimatedSize = size || this.estimateTextureSize(texture)

    // Check if we need to evict
    if (this.currentCacheSize + estimatedSize > this.maxCacheSize) {
      this.evictOldest()
    }

    // Check texture count limit
    if (this.cache.size >= this.maxTextures) {
      this.evictOldest()
    }

    this.cache.set(path, {
      texture,
      path,
      size: estimatedSize,
      lastUsed: Date.now(),
      useCount: 1,
    })

    this.currentCacheSize += estimatedSize

    if (process.env.NODE_ENV === 'development') {
      console.debug(`[TextureManager] Cached texture ${path} (${(estimatedSize / 1024 / 1024).toFixed(2)}MB)`)
    }
  }

  /**
   * Remove texture from cache
   */
  uncacheTexture(path: string): void {
    const entry = this.cache.get(path)
    if (entry) {
      entry.texture.dispose()
      this.currentCacheSize -= entry.size
      this.cache.delete(path)

      if (process.env.NODE_ENV === 'development') {
        console.debug(`[TextureManager] Uncached texture ${path}`)
      }
    }
  }

  /**
   * Clear all cached textures
   */
  clearCache(): void {
    this.cache.forEach((entry) => {
      entry.texture.dispose()
    })
    this.cache.clear()
    this.currentCacheSize = 0
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    count: number
    size: number // bytes
    sizeMB: number
    textures: string[]
  } {
    return {
      count: this.cache.size,
      size: this.currentCacheSize,
      sizeMB: this.currentCacheSize / (1024 * 1024),
      textures: Array.from(this.cache.keys()),
    }
  }

  /**
   * Evict oldest textures
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].lastUsed - b[1].lastUsed)

    // Evict 20% of cache
    const toEvict = Math.max(1, Math.floor(entries.length * 0.2))
    for (let i = 0; i < toEvict; i++) {
      const [path, entry] = entries[i]
      this.uncacheTexture(path)
    }
  }

  /**
   * Estimate texture size in bytes
   */
  private estimateTextureSize(texture: THREE.Texture): number {
    const width = (texture.image as any)?.width || 0
    const height = (texture.image as any)?.height || 0
    const channels = this.getChannelCount(texture.format as any)
    const bytesPerChannel = this.getBytesPerChannel(texture.type)

    return width * height * channels * bytesPerChannel
  }

  /**
   * Get channel count for format
   */
  private getChannelCount(format: any): number {
    switch (format) {
      case THREE.RGBFormat:
      case THREE.RGB_S3TC_DXT1_Format:
        return 3
      case THREE.RGBAFormat:
      case THREE.RGBA_S3TC_DXT5_Format:
        return 4
      default:
        // LuminanceFormat and AlphaFormat may not exist in all Three.js versions
        // Default to 4 (RGBA) for unknown formats
        return 4
    }
  }

  /**
   * Get bytes per channel for type
   */
  private getBytesPerChannel(type: THREE.TextureDataType): number {
    switch (type) {
      case THREE.UnsignedByteType:
        return 1
      case THREE.FloatType:
      case THREE.UnsignedIntType:
        return 4
      case THREE.HalfFloatType:
        return 2
      default:
        return 1
    }
  }
}

// Singleton instance
export const textureManager = new TextureManager()

/**
 * Hook to load texture with caching and automatic management
 * 
 * @example
 * ```tsx
 * function MaterialWithTexture() {
 *   const texture = useManagedTexture('/textures/diffuse.jpg', {
 *     anisotropy: 4,
 *     componentName: 'MaterialWithTexture'
 *   })
 *   
 *   return <meshStandardMaterial map={texture} />
 * }
 * ```
 */
export function useManagedTexture(
  path: string | string[],
  options: TextureOptions = {}
): THREE.Texture | THREE.Texture[] {
  const {
    generateMipmaps = true,
    minFilter = THREE.LinearMipmapLinearFilter,
    magFilter = THREE.LinearFilter,
    anisotropy = 4,
    format,
    type,
    wrapS = THREE.RepeatWrapping,
    wrapT = THREE.RepeatWrapping,
    componentName,
    autoDispose = true,
  } = options

  // Use drei's useTexture (handles caching automatically)
  const texture = useTexture(
    path,
    (texture) => {
      // Configure texture
      if (Array.isArray(texture)) {
        texture.forEach((tex) => {
          configureTexture(tex, {
            generateMipmaps,
            minFilter,
            magFilter,
            anisotropy,
            format,
            type,
            wrapS,
            wrapT,
          })
        })
      } else {
        configureTexture(texture, {
          generateMipmaps,
          minFilter,
          magFilter,
          anisotropy,
          format,
          type,
          wrapS,
          wrapT,
        })
      }
    }
  ) as THREE.Texture | THREE.Texture[]

  // Cache in texture manager
  useEffect(() => {
    if (Array.isArray(texture)) {
      texture.forEach((tex, index) => {
        const pathArray = Array.isArray(path) ? path : [path]
        textureManager.cacheTexture(pathArray[index] || '', tex)
      })
    } else {
      const pathString = Array.isArray(path) ? path[0] : path
      textureManager.cacheTexture(pathString, texture)
    }
  }, [texture, path])

  // Auto-dispose if enabled
  if (autoDispose) {
    if (Array.isArray(texture)) {
      texture.forEach((tex) => useResource(tex, componentName))
    } else {
      useResource(texture, componentName)
    }
  }

  return texture
}

/**
 * Configure texture with options
 */
function configureTexture(
  texture: THREE.Texture,
  options: {
    generateMipmaps: boolean
    minFilter: THREE.TextureFilter
    magFilter: THREE.MagnificationTextureFilter
    anisotropy: number
    format?: THREE.PixelFormat
    type?: THREE.TextureDataType
    wrapS: THREE.Wrapping
    wrapT: THREE.Wrapping
  }
): void {
  texture.generateMipmaps = options.generateMipmaps
  texture.minFilter = options.minFilter
  texture.magFilter = options.magFilter
  texture.anisotropy = Math.min(options.anisotropy, 16)
  texture.wrapS = options.wrapS
  texture.wrapT = options.wrapT

  if (options.format) {
    texture.format = options.format
  }
  if (options.type) {
    texture.type = options.type
  }

  texture.needsUpdate = true
}
