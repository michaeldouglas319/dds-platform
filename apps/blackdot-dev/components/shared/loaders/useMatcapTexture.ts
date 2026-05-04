import { useEffect, useState } from 'react'
import * as THREE from 'three'

/**
 * Create a procedural matcap texture as fallback
 * Generates a simple sphere-like lit appearance
 */
function createFallbackMatcapTexture(color: string = '#ffffff'): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')

  if (ctx) {
    // Fill with base color
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 512, 512)

    // Create a radial gradient for sphere-like appearance
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 362)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)

    // Add a bright highlight
    const highlightGradient = ctx.createRadialGradient(180, 180, 0, 180, 180, 100)
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = highlightGradient
    ctx.fillRect(80, 80, 200, 200)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * Custom hook to load matcap texture with error handling
 * Falls back to procedural texture if loading fails
 */
export const useMatcapTexture = (url: string) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader()

    textureLoader.load(
      url,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace
        setTexture(loadedTexture)
      },
      undefined,
      (error) => {
        // Create a fallback procedural matcap texture
        const fallbackTexture = createFallbackMatcapTexture('#888888')
        setTexture(fallbackTexture)
        console.warn(`Failed to load matcap texture from ${url}, using fallback`, error)
      }
    )
  }, [url])

  return texture
}
