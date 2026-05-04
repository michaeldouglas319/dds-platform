import { type AccessLevelType } from '@/lib/types/auth.types';

/**
 * Navigation configuration for the landing page
 *
 * This file documents the navigation dock setup and breakpoint configurations.
 * The actual route data comes from useFeaturedRoutes which reads from route-access.ts.
 */

/**
 * Navigation dock breakpoint configurations
 * Determines button count, scale, and layout based on screen size
 */
export interface NavigationBreakpointConfig {
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  minWidth: number;
  maxWidth?: number;
  buttonCount: number;
  buttonScale: number;
  layout: 'vertical' | 'horizontal';
  dockPosition: [number, number, number];
  spacing: number;
}

export const NAVIGATION_BREAKPOINTS: NavigationBreakpointConfig[] = [
  {
    breakpoint: 'mobile',
    minWidth: 0,
    maxWidth: 767,
    buttonCount: 3,
    buttonScale: 0.35,
    layout: 'vertical',
    dockPosition: [2.5, 0, 0], // Right side
    spacing: 1.5,
  },
  {
    breakpoint: 'tablet',
    minWidth: 768,
    maxWidth: 1023,
    buttonCount: 4,
    buttonScale: 0.28,
    layout: 'horizontal',
    dockPosition: [0, -5, 0], // Bottom
    spacing: 1.8,
  },
  {
    breakpoint: 'desktop',
    minWidth: 1024,
    maxWidth: Infinity,
    buttonCount: 6,
    buttonScale: 0.22,
    layout: 'horizontal',
    dockPosition: [0, -6, 0], // Bottom (further)
    spacing: 2.0,
  },
];

/**
 * Get navigation config for a specific breakpoint
 */
export function getNavigationConfig(
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): NavigationBreakpointConfig {
  return (
    NAVIGATION_BREAKPOINTS.find((bp) => bp.breakpoint === breakpoint) ||
    NAVIGATION_BREAKPOINTS[NAVIGATION_BREAKPOINTS.length - 1]
  );
}

/**
 * Determine breakpoint from window width
 */
export function getBreakpointFromWidth(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Navigation button access requirements
 * Routes marked as featured should have access level checks
 */
export interface NavigationButtonAccess {
  route: string;
  requiredLevel: AccessLevelType;
}

// Navigation buttons always show based on useFeaturedRoutes
// which respects route-access.ts rules automatically
