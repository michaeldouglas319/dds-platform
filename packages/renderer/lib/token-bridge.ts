/**
 * Token Bridge: Read CSS custom properties and convert to Three.js-compatible values.
 *
 * Enables unified design tokens shared between shadcn/ui components and Three.js materials.
 * CSS custom properties defined in your theme (via Tailwind or globals.css) are automatically
 * accessible to 3D scenes, ensuring visual coherence across UI and 3D.
 *
 * @module token-bridge
 * @example
 * ```tsx
 * // Define token in CSS:
 * // :root { --color-primary: #6366f1; }
 *
 * // Use in shadcn/ui via Tailwind:
 * <Button className="bg-[var(--color-primary)]">Click</Button>
 *
 * // Use in Three.js via bridge:
 * const color = getColorToken('--color-primary', '#6366f1');
 * material.uniforms.uColor.value = color;
 * ```
 *
 * @see {@link https://github.com/michaeldouglas319/dds-platform/blob/main/packages/renderer/lib/token-bridge-example.tsx}
 * for detailed examples.
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
 *
 * @param propertyName - CSS variable name (e.g., '--color-primary')
 * @param fallback - Default value if token not found
 * @returns The computed CSS property value, or fallback
 *
 * @internal - Use getColorToken, getNumericToken, or getStringToken instead
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
 *
 * Supports multiple color formats for flexibility:
 * - HSL: "hsl(226 71% 55%)" (Tailwind default with Tailwind v4)
 * - RGB: "99 102 241" (spaced RGB values, from --color-primary-rgb)
 * - Hex: "#6366f1" (traditional hex color)
 *
 * @param tokenName - CSS variable name (e.g., '--color-primary')
 * @param fallback - Default hex color if token not found (default: '#ffffff')
 * @returns THREE.Color ready for shader uniforms
 *
 * @example
 * ```tsx
 * const primaryColor = getColorToken('--color-primary', '#6366f1');
 * material.uniforms.uColor.value = primaryColor;
 * ```
 *
 * @remarks
 * Always provide a fallback color for SSR safety. If the token doesn't exist
 * in the document, the fallback is used instead.
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
 *
 * Useful for spacing, timing, opacity, and other numeric values
 * that should be consistent between UI and 3D scenes.
 *
 * @param tokenName - CSS variable name (e.g., '--animation-duration')
 * @param fallback - Default numeric value (default: 0)
 * @returns Parsed number, or fallback if invalid
 *
 * @example
 * ```tsx
 * const duration = getNumericToken('--animation-duration', 1.0);
 * material.uniforms.uDuration.value = duration;
 * ```
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
 *
 * Use for typography, font families, and other string-based tokens.
 *
 * @param tokenName - CSS variable name (e.g., '--font-sans')
 * @param fallback - Default string value
 * @returns CSS property value as string
 *
 * @example
 * ```tsx
 * const fontFamily = getStringToken('--font-sans', 'system-ui');
 * material.uniforms.uFontFamily.value = fontFamily;
 * ```
 */
export function getStringToken(
  tokenName: string,
  fallback = '',
): string {
  return getCSSProperty(tokenName, fallback);
}

/**
 * Bridge a single color token to a Three.js shader uniform.
 *
 * Updates a shader uniform's color value from a CSS token.
 * Safe to call if uniform is undefined.
 *
 * @param uniform - THREE.ShaderMaterial uniform with Color value
 * @param tokenName - CSS variable name
 * @param fallback - Hex color fallback
 *
 * @example
 * ```tsx
 * const material = new THREE.ShaderMaterial({
 *   uniforms: { uColor: { value: new THREE.Color() } }
 * });
 *
 * bridgeColorUniform(material.uniforms.uColor, '--color-primary', '#6366f1');
 * ```
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
 * Update multiple color uniforms in a shader material from CSS tokens.
 *
 * Maps uniform names to CSS token names. Only processes Color-type uniforms.
 * Safe to call with any THREE.Material (returns early if not ShaderMaterial).
 *
 * @param material - THREE.ShaderMaterial to update
 * @param tokenMap - Record mapping uniform name → CSS variable name
 *
 * @example
 * ```tsx
 * const material = new THREE.ShaderMaterial({
 *   uniforms: {
 *     uPrimaryColor: { value: new THREE.Color() },
 *     uAccentColor: { value: new THREE.Color() }
 *   }
 * });
 *
 * applyColorTokens(material, {
 *   uPrimaryColor: '--color-primary',
 *   uAccentColor: '--color-accent'
 * });
 * ```
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
 * Listen for theme changes (light/dark) and call callback.
 *
 * Observes:
 * 1. Changes to `data-theme` attribute on `<html>`
 * 2. System preference changes (prefers-color-scheme)
 *
 * When theme changes, call your callback to update materials, re-apply tokens, etc.
 *
 * @param callback - Function called when theme changes (light or dark)
 * @returns Unsubscribe function to clean up listeners
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const unsubscribe = subscribeToThemeChanges((theme) => {
 *     console.log(`Theme switched to: ${theme}`);
 *     // Re-apply tokens to materials here
 *     applyColorTokens(material, tokenMap);
 *   });
 *
 *   return () => unsubscribe();
 * }, []);
 * ```
 *
 * @remarks
 * Safe to call during SSR (returns no-op unsubscribe if document unavailable).
 * Use with useTokenBridge hook for automatic updates instead of manual handling.
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
 * Get the current theme (light or dark).
 *
 * Checks:
 * 1. `data-theme` attribute on `<html>`
 * 2. System preference (prefers-color-scheme media query)
 * 3. Defaults to 'dark' if unavailable
 *
 * @returns Current theme: 'light' or 'dark'
 *
 * @example
 * ```tsx
 * const theme = getCurrentTheme();
 * // Use theme to select appropriate token fallbacks
 * const bgColor = getColorToken(
 *   `--color-bg-${theme}`,
 *   theme === 'dark' ? '#000' : '#fff'
 * );
 * ```
 *
 * @remarks
 * Safe for SSR (returns 'dark' if document unavailable).
 */
export function getCurrentTheme(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'dark';
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'light' || theme === 'dark') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}
