/**
 * Responsive Layout Manager for Three.js Scenes
 *
 * Manages layout calculations, grid positioning, and camera settings
 * for responsive Three.js presentations. Adapts content positioning
 * and scaling based on viewport breakpoint and canvas dimensions.
 */

import type { Breakpoint } from '@/lib/hooks/useResponsiveCanvas';

/**
 * Configuration for responsive layout calculations
 */
export interface LayoutConfig {
  breakpoint: Breakpoint;
  canvasWidth: number;
  canvasHeight: number;
  aspectRatio: number;
}

/**
 * Camera configuration for responsive viewing
 */
export interface CameraSettings {
  fov: number;
  near: number;
  far: number;
  position: { x: number; y: number; z: number };
  aspect: number;
}

/**
 * Grid layout configuration
 */
export interface GridLayout {
  columns: number;
  rows: number;
  spacing: number;
  width: number;
}

/**
 * Scene bounds for content positioning
 */
export interface SceneBounds {
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * Manages responsive layout calculations for Three.js scenes
 *
 * Provides utilities for:
 * - Calculating scene bounds based on camera and viewport
 * - Computing grid layouts for different breakpoints
 * - Positioning items in grid
 * - Camera settings for responsive viewing
 * - Bounds calculations for content positioning
 */
export class ResponsiveLayoutManager {
  config: LayoutConfig;

  /**
   * Initialize layout manager with configuration
   * @param config - Layout configuration with breakpoint and canvas dimensions
   */
  constructor(config: LayoutConfig) {
    this.config = config;
  }

  /**
   * Update configuration (call when breakpoint or canvas size changes)
   * @param config - New layout configuration
   */
  updateConfig(config: Partial<LayoutConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Calculate scene bounds for responsive layout
   *
   * Computes the visible area in 3D space based on camera FOV
   * and distance. Used to constrain content positioning.
   *
   * Assumes:
   * - Camera FOV: 40 degrees
   * - Camera distance (z): 5 units
   * - Content positioned at z=0
   *
   * @returns SceneBounds with width, height, and aspect ratio
   */
  getSceneBounds(): SceneBounds {
    const { canvasWidth, canvasHeight, aspectRatio } = this.config;

    // Camera parameters (match camera setup in scene)
    const vFOV = 40; // vertical field of view in degrees
    const cameraDistance = 5; // distance from camera to content (z position)

    // Calculate visible height based on FOV
    const height = 2 * Math.tan((vFOV * Math.PI) / 180 / 2) * cameraDistance;

    // Calculate visible width based on aspect ratio
    const width = height * aspectRatio;

    return { width, height, aspectRatio };
  }

  /**
   * Get grid layout configuration for number of items
   *
   * Returns grid parameters optimized for the current breakpoint:
   * - Mobile: 1 column, vertical stack
   * - Tablet: 2 columns
   * - Desktop: 3-4 columns based on content
   *
   * @param itemCount - Number of items to layout
   * @returns GridLayout configuration
   */
  getGridLayout(itemCount: number): GridLayout {
    const { breakpoint } = this.config;

    if (breakpoint === 'mobile') {
      // Mobile: 1 column, vertical stack
      return {
        columns: 1,
        rows: itemCount,
        spacing: 1.5,
        width: 4
      };
    } else if (breakpoint === 'tablet') {
      // Tablet: 2 columns
      return {
        columns: 2,
        rows: Math.ceil(itemCount / 2),
        spacing: 1,
        width: 6
      };
    } else {
      // Desktop: 3+ columns based on item count
      const cols = Math.min(itemCount, 4);
      return {
        columns: cols,
        rows: Math.ceil(itemCount / cols),
        spacing: 0.8,
        width: 10
      };
    }
  }

  /**
   * Calculate 3D positions for grid items
   *
   * Distributes items in a grid layout with proper spacing.
   * Grid is centered horizontally and positioned in upper portion
   * of scene vertically.
   *
   * @param itemCount - Number of items to position
   * @returns Array of [x, y, z] positions for each item
   */
  getGridPositions(itemCount: number): Array<[number, number, number]> {
    const layout = this.getGridLayout(itemCount);
    const positions: Array<[number, number, number]> = [];

    // Calculate starting position (left-aligned, top-aligned)
    const startX = -layout.width / 2;
    const startY = layout.rows / 2;

    // Position each item in grid
    for (let i = 0; i < itemCount; i++) {
      const col = i % layout.columns;
      const row = Math.floor(i / layout.columns);

      // Calculate x position (center within column)
      const x = startX + (col * layout.width) / layout.columns + layout.width / (layout.columns * 2);

      // Calculate y position (center within row, decreasing downward)
      const y = startY - row * layout.spacing;

      // All content at z=0 (camera views from positive z)
      const z = 0;

      positions.push([x, y, z]);
    }

    return positions;
  }

  /**
   * Calculate single item position at index in grid
   *
   * @param index - Item index
   * @param totalCount - Total number of items in grid
   * @returns [x, y, z] position for the item
   */
  getGridItemPosition(index: number, totalCount: number): [number, number, number] {
    const positions = this.getGridPositions(totalCount);
    return positions[index] || [0, 0, 0];
  }

  /**
   * Get camera settings optimized for responsive viewing
   *
   * Adjusts:
   * - FOV: tighter on mobile, wider on desktop
   * - Position: closer on mobile, further on desktop
   * - Aspect ratio: derived from canvas dimensions
   *
   * @returns CameraSettings for PerspectiveCamera
   */
  getCameraSettings(): CameraSettings {
    const { breakpoint, aspectRatio } = this.config;

    let fov = 40;
    let z = 5;

    if (breakpoint === 'mobile') {
      fov = 50;
      z = 8;
    } else if (breakpoint === 'tablet') {
      fov = 45;
      z = 6;
    }

    return {
      fov,
      near: 0.1,
      far: 1000,
      position: { x: 0, y: 0, z },
      aspect: aspectRatio
    };
  }

  /**
   * Get padding/margin values for layout based on breakpoint
   *
   * Useful for positioning UI elements around the 3D scene
   *
   * @returns Padding object with top, bottom, left, right values
   */
  getLayoutPadding(): { top: number; bottom: number; left: number; right: number } {
    const { breakpoint } = this.config;

    if (breakpoint === 'mobile') {
      return { top: 0.5, bottom: 0.5, left: 0.3, right: 0.3 };
    } else if (breakpoint === 'tablet') {
      return { top: 1, bottom: 1, left: 0.8, right: 0.8 };
    } else {
      return { top: 1.5, bottom: 1.5, left: 1.5, right: 1.5 };
    }
  }

  /**
   * Calculate optimal content scale for breakpoint
   *
   * Returns scaling factor for text, models, and UI elements
   * to maintain readability and visual balance across breakpoints
   *
   * @returns Scale multiplier (1 = desktop baseline)
   */
  getContentScale(): number {
    const { breakpoint } = this.config;

    switch (breakpoint) {
      case 'mobile':
        return 0.6;
      case 'tablet':
        return 0.85;
      case 'desktop':
        return 1;
      default:
        return 1;
    }
  }

  /**
   * Calculate responsive font size for 3D text rendering
   *
   * @param baseSize - Base font size (e.g., 1 for 1 unit in 3D space)
   * @returns Scaled font size appropriate for breakpoint
   */
  getResponsiveFontSize(baseSize: number = 1): number {
    return baseSize * this.getContentScale();
  }

  /**
   * Get animation timing scale based on breakpoint
   *
   * Useful for adjusting animation durations on slower devices
   *
   * @returns Timing multiplier (1 = desktop baseline)
   */
  getAnimationTimingScale(): number {
    const { breakpoint } = this.config;

    switch (breakpoint) {
      case 'mobile':
        return 1.3; // Slower animations on mobile
      case 'tablet':
        return 1.1;
      case 'desktop':
        return 1;
      default:
        return 1;
    }
  }

  /**
   * Calculate bounds for safe content area
   *
   * Returns a rectangular area in 3D space that's safe for
   * positioning content without clipping on any breakpoint
   *
   * @returns Bounds with minX, maxX, minY, maxY, z coordinates
   */
  getSafeContentBounds() {
    const bounds = this.getSceneBounds();
    const padding = this.getLayoutPadding();

    return {
      minX: -bounds.width / 2 + padding.left,
      maxX: bounds.width / 2 - padding.right,
      minY: -bounds.height / 2 + padding.bottom,
      maxY: bounds.height / 2 - padding.top,
      z: 0
    };
  }

  /**
   * Calculate transition offset for slide navigation
   *
   * Returns the offset distance and direction for transitioning
   * between slides. Useful for camera movement animations.
   *
   * @param direction - 'next' or 'previous'
   * @returns [x, y, z] offset for camera transition
   */
  getSlideTransitionOffset(direction: 'next' | 'previous'): [number, number, number] {
    const offset = direction === 'next' ? 1 : -1;

    // Horizontal slide: move camera along x-axis
    const bounds = this.getSceneBounds();
    const xOffset = bounds.width * offset;

    return [xOffset, 0, 0];
  }
}

/**
 * Factory function to create a ResponsiveLayoutManager with defaults
 *
 * @param breakpoint - Current responsive breakpoint
 * @param canvasWidth - Canvas width in pixels
 * @param canvasHeight - Canvas height in pixels
 * @returns ResponsiveLayoutManager instance
 */
export function createLayoutManager(
  breakpoint: Breakpoint,
  canvasWidth: number,
  canvasHeight: number
): ResponsiveLayoutManager {
  const aspectRatio = canvasWidth / canvasHeight;

  return new ResponsiveLayoutManager({
    breakpoint,
    canvasWidth,
    canvasHeight,
    aspectRatio
  });
}
