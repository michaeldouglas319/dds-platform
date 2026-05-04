/**
 * WebGL Memory Monitoring Utilities
 * Helps track and prevent GPU memory exhaustion
 */

import * as THREE from 'three';

export interface MemoryStats {
  geometries: number;
  textures: number;
  materials: number;
  programs: number;
  estimatedMemoryMB: number;
}

/**
 * Get memory statistics from a Three.js renderer
 */
export function getRendererMemoryStats(renderer: THREE.WebGLRenderer): MemoryStats {
  const info = renderer.info;
  
  // Rough memory estimate
  // Geometry: ~12 bytes per vertex (position + normal + uv)
  // Texture: width * height * 4 bytes (RGBA)
  const geometryMemory = (info.memory.geometries * 10000) / (1024 * 1024); // Rough estimate
  const textureMemory = (info.memory.textures * 2) / (1024 * 1024); // Rough estimate: 2MB per texture avg
  const estimatedMemoryMB = geometryMemory + textureMemory;
  
  // In Three.js r166+, info.programs is an array of WebGL programs
  const programCount = info.programs?.length || 0;

  return {
    geometries: info.memory.geometries,
    textures: info.memory.textures,
    materials: programCount, // Three.js r166+ no longer tracks materials separately
    programs: programCount,
    estimatedMemoryMB: Math.round(estimatedMemoryMB * 100) / 100,
  };
}

/**
 * Check if memory usage is getting high
 */
export function isMemoryHigh(stats: MemoryStats): boolean {
  // Warn if using more than 400MB (conservative limit)
  return stats.estimatedMemoryMB > 400;
}

/**
 * Log memory statistics for debugging
 */
export function logMemoryStats(renderer: THREE.WebGLRenderer, label?: string): void {
  const stats = getRendererMemoryStats(renderer);
  const prefix = label ? `[${label}] ` : '';
  
  console.log(`${prefix}Memory Stats:`, {
    geometries: stats.geometries,
    textures: stats.textures,
    materials: stats.materials,
    programs: stats.programs,
    estimatedMB: `${stats.estimatedMemoryMB}MB`,
    isHigh: isMemoryHigh(stats) ? '⚠️ HIGH' : '✓ OK',
  });
  
  if (isMemoryHigh(stats)) {
    console.warn(`${prefix}⚠️ High memory usage detected! Consider optimizing models or disposing unused resources.`);
  }
}

/**
 * Force garbage collection of WebGL resources
 * Call this periodically or when memory gets high
 */
export function forceGarbageCollection(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void {
  // Dispose of unused geometries
  const geometries = new Set<THREE.BufferGeometry>();
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh && object.geometry) {
      geometries.add(object.geometry);
    }
  });
  
  // Clear renderer caches
  renderer.dispose();
  
  // Force garbage collection hint (browser may or may not honor this)
  if ('gc' in window && typeof (window as Window & { gc?: () => void }).gc === 'function') {
    (window as Window & { gc: () => void }).gc();
  }
}

/**
 * Monitor memory and warn when it gets high
 */
export function createMemoryMonitor(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  options: {
    checkInterval?: number; // ms
    warningThreshold?: number; // MB
    onWarning?: (stats: MemoryStats) => void;
  } = {}
) {
  const {
    checkInterval = 5000, // Check every 5 seconds
    warningThreshold = 400, // Warn at 400MB
    onWarning,
  } = options;
  
  const intervalId = setInterval(() => {
    const stats = getRendererMemoryStats(renderer);
    
    if (stats.estimatedMemoryMB > warningThreshold) {
      logMemoryStats(renderer, 'Memory Monitor');
      if (onWarning) {
        onWarning(stats);
      }
    }
  }, checkInterval);
  
  return () => {
    clearInterval(intervalId);
  };
}




