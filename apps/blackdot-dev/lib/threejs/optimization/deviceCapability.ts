/**
 * Device Capability Detection
 * Detects device capabilities (GPU, memory, screen size) for model optimization
 * 
 * BEST PRACTICE: Uses singleton pattern to avoid creating multiple WebGL contexts
 * Each WebGL context creation consumes browser resources. Browsers limit ~8 active contexts.
 */

export interface DeviceCapabilities {
  isMobile: boolean;
  isLowEnd: boolean;
  gpuMemory: number;
  maxTextureSize: number;
  supportsWebGL2: boolean;
  supportsInstancedArrays: boolean;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  hardwareConcurrency: number;
  totalMemory?: number;
  maxParticles: number;
  gpuTier?: 'low' | 'medium' | 'high';
  enableShadows?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

/**
 * Cached device capabilities (singleton pattern)
 * Prevents multiple WebGL context creation
 */
let cachedCapabilities: DeviceCapabilities | null = null;

/**
 * Detect device capabilities
 * Runs browser feature detection to determine optimal rendering settings
 * 
 * IMPROVEMENT: Uses singleton pattern - creates WebGL context once, caches result
 * Properly disposes WebGL context after reading parameters to prevent context exhaustion
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  // Return cached result if available
  if (cachedCapabilities !== null) {
    return cachedCapabilities;
  }

  // Detect mobile
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

  // Detect screen size (these can change, but we cache initial detection)
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const devicePixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

  // Detect hardware
  const hardwareConcurrency = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
  const isLowEnd = isMobile && hardwareConcurrency < 4;

  // GPU detection via WebGL
  let maxTextureSize = 2048;
  let supportsWebGL2 = false;
  let supportsInstancedArrays = false;
  let gpuMemory = 256; // Default in MB

  if (typeof window !== 'undefined') {
    try {
      // Create temporary canvas for WebGL detection
      const canvas = document.createElement('canvas');
      let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
      
      try {
        // Try WebGL2 first
        gl = canvas.getContext('webgl2', { 
          // Use minimal context attributes to reduce resource usage
          alpha: false,
          depth: false,
          stencil: false,
          antialias: false,
          preserveDrawingBuffer: false,
          powerPreference: 'default'
        } as WebGLContextAttributes);
        supportsWebGL2 = gl !== null;

        // Fallback to WebGL1
        if (!gl) {
          gl = canvas.getContext('webgl', {
            alpha: false,
            depth: false,
            stencil: false,
            antialias: false,
            preserveDrawingBuffer: false,
            powerPreference: 'default'
          } as WebGLContextAttributes);
        }

        if (gl) {
          // Read WebGL parameters
          const maxTextureSizeParam = gl.getParameter(gl.MAX_TEXTURE_SIZE);
          maxTextureSize = maxTextureSizeParam || 2048;

          // Check for instanced arrays extension
          const ext = gl.getExtension('ANGLE_instanced_arrays');
          supportsInstancedArrays = ext !== null;

          // Rough GPU memory estimation
          // Modern GPUs: 2GB-12GB, estimate based on texture support
          if (maxTextureSize >= 4096) {
            gpuMemory = isMobile ? 512 : 2048;
          } else if (maxTextureSize >= 2048) {
            gpuMemory = isMobile ? 256 : 1024;
          } else {
            gpuMemory = isMobile ? 128 : 512;
          }

          // CRITICAL: Force context loss to free resources immediately
          // This prevents context exhaustion when multiple components call this function
          try {
            const loseContext = gl.getExtension('WEBGL_lose_context');
            if (loseContext) {
              loseContext.loseContext();
            }
          } catch (e) {
            // Extension not available, continue
          }
        }
      } finally {
        // Clean up canvas reference
        // Note: Canvas will be garbage collected, but we've already lost the context above
        canvas.width = 0;
        canvas.height = 0;
      }
    } catch (_e) {
      // Fallback values if WebGL detection fails
      gpuMemory = isMobile ? 128 : 512;
    }
  }

  // Calculate max particles based on capabilities
  const maxParticles = isLowEnd ? 1000 : isMobile ? 5000 : 20000;

  // Cache the result
  cachedCapabilities = {
    isMobile,
    isLowEnd,
    gpuMemory,
    maxTextureSize,
    supportsWebGL2,
    supportsInstancedArrays,
    screenWidth,
    screenHeight,
    devicePixelRatio,
    hardwareConcurrency,
    maxParticles,
  };

  return cachedCapabilities;
}

/**
 * Reset cached capabilities (useful for testing or when device capabilities change)
 */
export function resetDeviceCapabilitiesCache(): void {
  cachedCapabilities = null;
}

/**
 * Model optimization options based on device capabilities
 */
export interface ModelOptimizationOptions {
  textureDensity: 'low' | 'medium' | 'high';
  maxTextureSize: number;
  drainToLowest: boolean;
  skipTextures: boolean;
  skipNormals: boolean;
  mergeGeometries: boolean;
  useLOD: boolean;
  enableShadows: boolean;
  maxGeometries: number;
}

/**
 * Get optimal model options based on device capabilities
 */
export function getOptimalModelOptions(capabilities: DeviceCapabilities): ModelOptimizationOptions {
  if (capabilities.isLowEnd) {
    return {
      textureDensity: 'low',
      maxTextureSize: 512,
      drainToLowest: true,
      skipTextures: false,
      skipNormals: true,
      mergeGeometries: true,
      useLOD: false,
      enableShadows: false,
      maxGeometries: 5,
    };
  }

  if (capabilities.isMobile) {
    return {
      textureDensity: 'medium',
      maxTextureSize: Math.min(1024, capabilities.maxTextureSize),
      drainToLowest: false,
      skipTextures: false,
      skipNormals: false,
      mergeGeometries: true,
      useLOD: true,
      enableShadows: false,
      maxGeometries: 10,
    };
  }

  // Desktop high-end
  return {
    textureDensity: 'high',
    maxTextureSize: Math.min(4096, capabilities.maxTextureSize),
    drainToLowest: false,
    skipTextures: false,
    skipNormals: false,
    mergeGeometries: false,
    useLOD: true,
    enableShadows: true,
    maxGeometries: 50,
  };
}
