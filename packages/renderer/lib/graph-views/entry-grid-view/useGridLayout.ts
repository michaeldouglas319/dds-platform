/**
 * CSS Grid Layout Hook
 *
 * Provides responsive grid layout configuration for EntryGridView.
 * Handles responsive column counts and spacing calculations.
 *
 * @module useGridLayout
 */

import { useMemo } from 'react';

/**
 * Grid layout styles object
 */
export interface GridLayoutStyles {
  container: {
    display: string;
    gridTemplateColumns: string;
    gap: string;
  };
}

/**
 * useGridLayout Hook
 *
 * Generates CSS Grid layout styles based on column count and spacing.
 * Responsive by default using CSS media queries.
 *
 * @param columns - Number of columns (1-6, default 3)
 * @param spacing - Gap between items in pixels (default 16)
 * @returns GridLayoutStyles object with container styles
 *
 * @example
 * ```tsx
 * const gridStyles = useGridLayout(3, 16);
 * // Returns: { container: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' } }
 * ```
 */
export function useGridLayout(columns: number = 3, spacing: number = 16): GridLayoutStyles {
  return useMemo(() => {
    // Clamp columns to valid range
    const clampedColumns = Math.max(1, Math.min(6, columns));
    const gapPx = `${Math.max(0, spacing)}px`;

    return {
      container: {
        display: 'grid',
        gridTemplateColumns: `repeat(${clampedColumns}, 1fr)`,
        gap: gapPx,
      },
    };
  }, [columns, spacing]);
}

/**
 * Responsive grid layout configuration
 *
 * Default breakpoints for different screen sizes:
 * - xs (mobile): 1 column
 * - sm (tablet): 2 columns
 * - md (desktop): 3 columns
 * - lg (wide): 4 columns
 *
 * Use CSS media queries to override the base column count:
 *
 * ```css
 * .grid-container {
 *   display: grid;
 *   grid-template-columns: repeat(3, 1fr);
 *   gap: 16px;
 * }
 *
 * @media (max-width: 640px) {
 *   .grid-container {
 *     grid-template-columns: 1fr;
 *   }
 * }
 *
 * @media (max-width: 1024px) {
 *   .grid-container {
 *     grid-template-columns: repeat(2, 1fr);
 *   }
 * }
 *
 * @media (min-width: 1280px) {
 *   .grid-container {
 *     grid-template-columns: repeat(4, 1fr);
 *   }
 * }
 * ```
 */
export const RESPONSIVE_BREAKPOINTS = {
  xs: { maxWidth: '640px', columns: 1 },
  sm: { maxWidth: '1024px', columns: 2 },
  md: { minWidth: '1024px', columns: 3 },
  lg: { minWidth: '1280px', columns: 4 },
} as const;

/**
 * Generate CSS media query for grid layout
 *
 * @param columns - Number of columns
 * @param spacing - Gap in pixels
 * @returns CSS string for media query
 *
 * @example
 * ```tsx
 * const css = generateGridMediaQuery(4, 20);
 * // "@media (max-width: 1024px) { ... grid-template-columns: repeat(4, 1fr); ... }"
 * ```
 */
export function generateGridMediaQuery(columns: number, spacing: number): string {
  return `
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
    @media (min-width: 641px) and (max-width: 1023px) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (min-width: 1024px) and (max-width: 1279px) {
      grid-template-columns: repeat(3, 1fr);
    }
    @media (min-width: 1280px) {
      grid-template-columns: repeat(4, 1fr);
    }
    gap: ${spacing}px;
  `;
}
