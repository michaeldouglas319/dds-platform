/**
 * Token Bridge: Read CSS custom properties and convert to Three.js-compatible values.
 * Enables unified design tokens shared between shadcn/ui and 3D scenes.
 */

import type { Uniform, Color } from 'three';
import * as THREE from 'three';

export interface TokenBridgeConfig {
  cssPropertyName: string;
  fallback: string;
  convertFn?: (value: string) => unknown;
}

/**
 * Read a CSS custom property from the document root.
 * Falls back to provided default if not found.
 */
function getCSSProperty(propertyName: string, fallback = ''): string {
  if (typeof document === 'undefined') return fallback;
  const style = getComputedStyle(document.documentElement);
  const value = style.getPropertyValue(propertyName).trim();
  return value || fallback;
}

/**
 * Convert HSL string to THREE.Color.
 * Supports formats: "hsl(h s% l%)" or "#rrggbb"
 */
function hslToColor(hslString: string): THREE.Color {
  // If it's already a hex color, use it directly
  if (hslString.startsWith('#')) {
    return new THREE.Color(hslString);
  }

  // Parse HSL: "hsl(226 71% 55%)" → [226, 71, 55]
  const match = hslString.match(/hsl\(\s*(\d+)\s+(\d+)%\s+(\d+)%\s*\)/);
  if (!match) {
    // Fallback to parsing as a hex or named color
    return new THREE.Color(hslString || '#ffffff');
  }

  const [, h, s, l] = match.map(Number);
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  // HSL to RGB conversion
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((hNorm * 6) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (hNorm < 1 / 6) {
    r = c;
    g = x;
  } else if (hNorm < 2 / 6) {
    r = x;
    g = c;
  } else if (hNorm < 3 / 6) {
    g = c;
    b = x;
  } else if (hNorm < 4 / 6) {
    g = x;
    b = c;
  } else if (hNorm < 5 / 6) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return new THREE.Color(r + m, g + m, b + m);
}

/**
 * Parse RGB string "r g b" and return THREE.Color.
 */
function rgbToColor(rgbString: string): THREE.Color {
  const values = rgbString.split(/\s+/).map(Number);
  if (values.length >= 3) {
    return new THREE.Color(
      Math.min(values[0] / 255, 1),
      Math.min(values[1] / 255, 1),
      Math.min(values[2] / 255, 1),
    );
  }
  return new THREE.Color('#ffffff');
}

/**
 * Read a color token and convert to THREE.Color.
 * Tries HSL first, then RGB, then hex.
 */
export function getColorToken(
  tokenName: string,
  fallback = '#ffffff',
): THREE.Color {
  const value = getCSSProperty(tokenName, fallback);

  // Try HSL
  if (value.includes('hsl')) {
    return hslToColor(value);
  }

  // Try RGB values (e.g., "99 102 241" from --color-primary-rgb)
  if (!value.includes('#') && !value.includes('hsl')) {
    return rgbToColor(value);
  }

  // Fallback to hex
  return new THREE.Color(value);
}

/**
 * Read a numeric token from CSS custom property.
 */
export function getNumericToken(
  tokenName: string,
  fallback = 0,
): number {
  const value = getCSSProperty(tokenName, String(fallback));
  const num = parseFloat(value);
  return isNaN(num) ? fallback : num;
}

/**
 * Read a string token (e.g., font family).
 */
export function getStringToken(
  tokenName: string,
  fallback = '',
): string {
  return getCSSProperty(tokenName, fallback);
}

/**
 * Bridge a single token to a Three.js uniform.
 * Automatically converts CSS values to appropriate Three.js types.
 */
export function bridgeColorUniform(
  uniform: Uniform<THREE.Color>,
  tokenName: string,
  fallback = '#ffffff',
): void {
  if (uniform && uniform.value) {
    const color = getColorToken(tokenName, fallback);
    uniform.value.copy(color);
  }
}

/**
 * Update all color-based uniforms in a material from CSS tokens.
 * Maps token names to uniform names.
 */
export function applyColorTokens(
  material: THREE.Material,
  tokenMap: Record<string, string>,
): void {
  if (!material || !('uniforms' in material)) return;

  const uniforms = (material as THREE.ShaderMaterial).uniforms;
  if (!uniforms) return;

  for (const [uniformName, tokenName] of Object.entries(tokenMap)) {
    const uniform = uniforms[uniformName];
    if (uniform && uniform.value instanceof THREE.Color) {
      bridgeColorUniform(uniform, tokenName);
    }
  }
}

/**
 * Listen for theme changes and update all materials in a scene.
 * Returns an unsubscribe function.
 */
export function subscribeToThemeChanges(
  callback: (theme: 'light' | 'dark') => void,
): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const observer = new MutationObserver(() => {
    const theme = (document.documentElement.getAttribute('data-theme') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light') as 'light' | 'dark';
    callback(theme);
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  // Also listen for system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e: MediaQueryListEvent) => {
    if (!document.documentElement.hasAttribute('data-theme')) {
      callback(e.matches ? 'dark' : 'light');
    }
  };
  mediaQuery.addEventListener('change', handleChange);

  return () => {
    observer.disconnect();
    mediaQuery.removeEventListener('change', handleChange);
  };
}

/**
 * Convenience hook-like export for getting current theme.
 */
export function getCurrentTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'dark';
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'light' || theme === 'dark') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}
