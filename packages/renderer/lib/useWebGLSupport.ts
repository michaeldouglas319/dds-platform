'use client';

import { useEffect, useState } from 'react';

/**
 * useWebGLSupport - Detect WebGL availability and handle context loss gracefully.
 * Returns true if WebGL is available, false if unavailable or disabled.
 * @returns {boolean} Whether WebGL 2.0 is supported
 */
export function useWebGLSupport(): boolean {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const canvas = document.createElement('canvas');

    try {
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setIsSupported(!!context);
    } catch {
      setIsSupported(false);
    }
  }, []);

  return isSupported;
}

/**
 * checkWebGLSupport - Synchronously check WebGL availability (server-safe).
 * Returns true if we're in browser and WebGL is likely available.
 * @returns {boolean} Whether WebGL is likely supported
 */
export function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return true; // SSR-safe: assume available

  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return !!context;
  } catch {
    return false;
  }
}
