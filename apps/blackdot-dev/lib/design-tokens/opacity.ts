/**
 * Global Opacity Scale
 * Based on Tailwind CSS opacity utilities (standard in web design)
 * https://tailwindcss.com/docs/opacity
 * https://github.com/tailwindlabs/tailwindcss/blob/master/stubs/config.full.js
 */

export const OPACITY_SCALE = {
  0: '0',
  5: '0.05',
  10: '0.1',
  20: '0.2',
  25: '0.25',
  30: '0.3',
  40: '0.4',
  50: '0.5',
  60: '0.6',
  70: '0.7',
  75: '0.75',
  80: '0.8',
  90: '0.9',
  95: '0.95',
  100: '1',
} as const;

export type OpacityKey = keyof typeof OPACITY_SCALE;

/**
 * Get opacity value from Tailwind scale
 * @param key Opacity scale key (0, 5, 10, 20, etc.)
 * @returns Opacity decimal value (0-1)
 */
export function getOpacity(key: OpacityKey): string {
  return OPACITY_SCALE[key];
}
