/**
 * Global Z-Index Scale
 * Based on shadcn/ui and common web design patterns
 * Prevents z-index conflicts and ensures consistent layering
 * https://github.com/shadcn-ui/ui/tree/main/apps/www/components/ui
 * https://developer.mozilla.org/en-US/docs/Web/CSS/z-index
 */

export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;

/**
 * Get z-index value from scale
 * Based on Bootstrap's z-index scale
 * https://getbootstrap.com/docs/5.0/customize/sass-variables/#z-index
 */
export function getZIndex(key: ZIndexKey): number {
  return Z_INDEX[key];
}
