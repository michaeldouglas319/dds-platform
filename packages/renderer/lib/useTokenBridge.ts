/**
 * React hook to access and update tokens from Three.js materials.
 * Subscribes to theme changes and automatically updates uniforms.
 */

import { useEffect, useRef } from 'react';
import type { ShaderMaterial } from 'three';
import {
  getColorToken,
  getNumericToken,
  getStringToken,
  applyColorTokens,
  subscribeToThemeChanges,
} from './token-bridge';

export interface UseTokenBridgeOptions {
  /** Material(s) to apply tokens to */
  material?: ShaderMaterial | ShaderMaterial[];
  /** Token name -> uniform name mapping for color tokens */
  colorTokens?: Record<string, string>;
  /** Callback when theme changes */
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

/**
 * Hook to apply design tokens to Three.js materials and listen for theme changes.
 *
 * @example
 * ```tsx
 * const { getColor, getNumber, getTheme } = useTokenBridge({
 *   material: shaderRef.current,
 *   colorTokens: { uPrimaryColor: '--color-primary' }
 * });
 *
 * // In effect:
 * const primaryColor = getColor('--color-primary');
 * ```
 */
export function useTokenBridge(options?: UseTokenBridgeOptions) {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const materials = options?.material
      ? Array.isArray(options.material)
        ? options.material
        : [options.material]
      : [];

    // Apply color tokens to materials
    if (options?.colorTokens && materials.length > 0) {
      materials.forEach((material) => {
        applyColorTokens(material, options.colorTokens!);
      });
    }

    // Subscribe to theme changes
    if (materials.length > 0 || options?.onThemeChange) {
      unsubscribeRef.current = subscribeToThemeChanges((theme) => {
        // Reapply tokens when theme changes
        if (options?.colorTokens && materials.length > 0) {
          materials.forEach((material) => {
            applyColorTokens(material, options.colorTokens!);
          });
        }
        options?.onThemeChange?.(theme);
      });
    }

    return () => {
      unsubscribeRef.current?.();
    };
  }, [options?.material, options?.colorTokens, options?.onThemeChange]);

  return {
    /** Get a color token as THREE.Color */
    getColor: getColorToken,
    /** Get a numeric token (spacing, duration, etc.) */
    getNumber: getNumericToken,
    /** Get a string token (font family, etc.) */
    getString: getStringToken,
  };
}
