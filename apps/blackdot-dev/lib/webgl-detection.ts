/**
 * WebGL Detection Utility
 *
 * Provides methods to detect WebGL support and availability.
 * Used to provide graceful fallback when WebGL is unavailable.
 */

/**
 * Detects if WebGL is supported and available in the current environment
 */
export function canUseWebGL(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      (canvas.getContext('webgl2') as any) ||
      (canvas.getContext('experimental-webgl') as any);

    const contextLossExt = gl?.getExtension('WEBGL_lose_context');
    if (contextLossExt) {
      contextLossExt.loseContext();
    }

    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * Gets detailed WebGL capabilities and diagnostics
 */
export function getWebGLInfo(): {
  supported: boolean;
  version: string | null;
  vendor: string | null;
  renderer: string | null;
  error: string | null;
} {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      version: null,
      vendor: null,
      renderer: null,
      error: 'Server-side rendering environment',
    };
  }

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) {
      return {
        supported: false,
        version: null,
        vendor: null,
        renderer: null,
        error: 'WebGL context creation failed',
      };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(gl.VENDOR) : gl.getParameter(gl.VENDOR);
    const renderer = debugInfo ? gl.getParameter(gl.RENDERER) : gl.getParameter(gl.RENDERER);

    const version = gl.getParameter(gl.VERSION);

    const contextLossExt = gl.getExtension('WEBGL_lose_context');
    if (contextLossExt) {
      contextLossExt.loseContext();
    }

    return {
      supported: true,
      version: typeof version === 'string' ? version : null,
      vendor: typeof vendor === 'string' ? vendor : null,
      renderer: typeof renderer === 'string' ? renderer : null,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      supported: false,
      version: null,
      vendor: null,
      renderer: null,
      error: errorMessage,
    };
  }
}

/**
 * Checks if running in a sandboxed environment
 */
export function isSandboxed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check for common sandboxing indicators
  const indicators = [
    !window.opener, // No window opener
    window.self !== window.top, // Running in iframe
    (navigator as any).sandboxed === true, // Explicit sandbox flag
    (document as any).domain !== window.location.hostname, // Domain mismatch
  ];

  // More reliable: try to access certain browser features
  try {
    // Sandboxed contexts often have restricted feature access
    const canvas = document.createElement('canvas');
    canvas.getContext('webgl2');
    return false; // If we got here, probably not heavily sandboxed
  } catch {
    return true;
  }
}
