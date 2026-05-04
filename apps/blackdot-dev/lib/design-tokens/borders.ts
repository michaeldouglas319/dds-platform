/**
 * Global Border Radius Scale
 * Based on Tailwind CSS border-radius utilities
 * https://tailwindcss.com/docs/border-radius
 * https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/config.full.js
 */

export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',     // 2px
  base: '0.25rem',    // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
  full: '9999px',
} as const;

export type BorderRadiusKey = keyof typeof BORDER_RADIUS;

/**
 * Get border-radius value from Tailwind scale
 */
export function getBorderRadius(key: BorderRadiusKey): string {
  return BORDER_RADIUS[key];
}
