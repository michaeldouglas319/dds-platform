/**
 * Theme Color Utilities
 * Extracts CSS variables from DOM for use in Three.js materials
 *
 * Best Practices Applied:
 * - SSR-safe (checks for window)
 * - Reactive to theme changes
 * - Cached for performance
 * - Type-safe color conversions
 */

import * as THREE from 'three';

/**
 * Parse HSL string to RGB values
 * Tailwind CSS variables are in HSL format (e.g., "222.2 84% 4.9%")
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return {
    r: r + m,
    g: g + m,
    b: b + m,
  };
}

/**
 * Get CSS variable value from root
 * @param varName - CSS variable name (e.g., '--background')
 * @returns HSL string or fallback
 */
export function getCSSVariable(varName: string, fallback: string = '0 0% 0%'): string {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    return value || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Parse HSL string from CSS variable
 * @param hslString - HSL string (e.g., "222.2 84% 4.9%")
 * @returns Object with h, s, l values
 */
export function parseHSL(hslString: string): { h: number; s: number; l: number } {
  const parts = hslString.split(' ');

  if (parts.length === 3) {
    return {
      h: parseFloat(parts[0]) || 0,
      s: parseFloat(parts[1]) || 0,
      l: parseFloat(parts[2]) || 0,
    };
  }

  return { h: 0, s: 0, l: 0 };
}

/**
 * Get background color as THREE.Color
 */
export function getBackgroundColor(): THREE.Color {
  const hslString = getCSSVariable('--background', '0 0% 100%');
  const { h, s, l } = parseHSL(hslString);
  const { r, g, b } = hslToRgb(h, s, l);
  return new THREE.Color(r, g, b);
}

/**
 * Get foreground color as THREE.Color
 */
export function getForegroundColor(): THREE.Color {
  const hslString = getCSSVariable('--foreground', '0 0% 0%');
  const { h, s, l } = parseHSL(hslString);
  const { r, g, b } = hslToRgb(h, s, l);
  return new THREE.Color(r, g, b);
}

/**
 * Get primary color as THREE.Color
 */
export function getPrimaryColor(): THREE.Color {
  const hslString = getCSSVariable('--primary', '221.2 83.2% 53.3%');
  const { h, s, l } = parseHSL(hslString);
  const { r, g, b } = hslToRgb(h, s, l);
  return new THREE.Color(r, g, b);
}

/**
 * Get muted color as THREE.Color
 */
export function getMutedColor(): THREE.Color {
  const hslString = getCSSVariable('--muted', '210 40% 96.1%');
  const { h, s, l } = parseHSL(hslString);
  const { r, g, b } = hslToRgb(h, s, l);
  return new THREE.Color(r, g, b);
}

/**
 * Check if current theme is dark
 */
export function isDarkTheme(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return document.documentElement.classList.contains('dark');
  } catch {
    return false;
  }
}

/**
 * Get theme-aware color (light/dark variants)
 * @param lightColor - Color for light theme
 * @param darkColor - Color for dark theme
 */
export function getThemeColor(lightColor: string, darkColor: string): THREE.Color {
  const isDark = isDarkTheme();
  return new THREE.Color(isDark ? darkColor : lightColor);
}

/**
 * Color cache for performance
 * Avoids recalculating colors on every frame
 */
const colorCache = new Map<string, { color: THREE.Color; timestamp: number }>();
const CACHE_DURATION = 1000; // 1 second

/**
 * Get cached color or calculate new
 * @param key - Cache key
 * @param calculator - Function to calculate color
 */
export function getCachedColor(key: string, calculator: () => THREE.Color): THREE.Color {
  const now = Date.now();
  const cached = colorCache.get(key);

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.color;
  }

  const color = calculator();
  colorCache.set(key, { color, timestamp: now });
  return color;
}

/**
 * Clear color cache (call on theme change)
 */
export function clearColorCache(): void {
  colorCache.clear();
}
