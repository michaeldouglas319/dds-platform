/**
 * Global Color System
 * Based on shadcn/ui color handling and OKLCH color space
 * https://github.com/shadcn-ui/ui/blob/main/apps/www/lib/utils.ts
 * Maps semantic color names to theme-aware CSS variables
 */

// Semantic color palette - maps to CSS variables defined in globals.css
export const SEMANTIC_COLORS = {
  primary: 'primary',
  secondary: 'secondary',
  accent: 'accent',
  destructive: 'destructive',
  muted: 'muted',
  background: 'background',
  foreground: 'foreground',
  card: 'card',
  border: 'border',
} as const;

export type SemanticColor = (typeof SEMANTIC_COLORS)[keyof typeof SEMANTIC_COLORS];

/**
 * Chart/section color palette
 * Maps to theme semantic colors and CSS variables
 */
export const SECTION_COLORS = {
  primary: 'primary',
  secondary: 'secondary',
  accent: 'accent',
  'chart-1': 'chart-1',
  'chart-2': 'chart-2',
  'chart-3': 'chart-3',
  'chart-4': 'chart-4',
  'chart-5': 'chart-5',
} as const;

export type SectionColorKey = keyof typeof SECTION_COLORS;

/**
 * Map a hex color to a theme semantic color
 * Used for Business/Ideas section colors
 * Based on shadow/chart color mapping from configuration
 * @param hexColor Hex color value
 * @returns Theme semantic color name
 */
export function mapSectionColorToTheme(
  hexColor: string
): SectionColorKey | 'primary' {
  const colorMap: Record<string, SectionColorKey | 'primary'> = {
    '#FF6B6B': 'chart-1',    // Red
    '#4ECDC4': 'chart-2',    // Teal/Cyan
    '#45B7D1': 'accent',     // Blue
    '#FFA07A': 'chart-4',    // Light salmon/orange
    '#98D8C8': 'chart-3',    // Mint/light green
    '#FFD93D': 'chart-5',    // Yellow
    '#FF8B94': 'chart-1',    // Pink-red
    '#A8E6CF': 'chart-3',    // Light green
    '#FFD3B6': 'chart-4',    // Light orange
    '#FFAAA5': 'chart-1',    // Light red
  };
  return colorMap[hexColor] || 'primary';
}

/**
 * Get color classes for a given theme color
 * Returns Tailwind class names for different opacity levels
 * Based on shadcn/ui component patterns
 * https://github.com/shadcn-ui/ui/blob/main/apps/www/components/ui
 * @param colorKey Semantic color or section color key
 * @returns Object with color class names for different uses
 */
export function getColorClasses(colorKey: string) {
  return {
    text: `text-${colorKey}`,
    bg: `bg-${colorKey}`,
    bgLight: `bg-${colorKey}/10`,
    bgLighter: `bg-${colorKey}/5`,
    bgOpaque: `bg-${colorKey}/80`,
    border: `border-${colorKey}`,
    borderLight: `border-${colorKey}/30`,
    borderLighter: `border-${colorKey}/10`,
    ring: `ring-${colorKey}`,
  };
}

/**
 * Get section color classes from hex color
 * Automatically maps hex to theme color and returns classes
 * @param hexColor Hex color value (e.g., "#FF6B6B")
 * @returns Object with color class names
 */
export function getSectionColorClasses(hexColor: string) {
  const themeColor = mapSectionColorToTheme(hexColor);
  return getColorClasses(themeColor);
}
