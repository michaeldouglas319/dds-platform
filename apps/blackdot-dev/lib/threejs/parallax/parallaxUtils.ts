/**
 * Parallax Utility Functions
 * Helper functions for offset calculations and parallax positioning
 */

import * as THREE from 'three';

/**
 * Calculate the target Y position for a parallax block
 * @param offset - Section offset index
 * @param factor - Height multiplier
 * @param scrollProgress - Normalized scroll progress (0-1)
 * @param parallaxFactor - Speed multiplier for depth
 * @returns Target Y position for the block
 */
export function calculateParallaxY(
  offset: number,
  factor: number,
  scrollProgress: number,
  parallaxFactor: number = 1.0
): number {
  return offset * factor * 10 - scrollProgress * factor * parallaxFactor * 10;
}

/**
 * Interpolate smoothly between two values (lerp)
 * @param current - Current value
 * @param target - Target value
 * @param alpha - Lerp amount (0-1, higher = faster)
 * @returns Interpolated value
 */
export function lerp(current: number, target: number, alpha: number = 0.1): number {
  return THREE.MathUtils.lerp(current, target, alpha);
}

/**
 * Calculate section index from scroll progress
 * @param progress - Normalized scroll progress (0-1)
 * @param totalSections - Total number of sections
 * @returns Current section index
 */
export function getSectionIndex(progress: number, totalSections: number): number {
  return Math.floor(progress * totalSections);
}

/**
 * Calculate scroll factor for viewport-dependent calculations
 * @param scrollY - Raw scroll position
 * @param viewportHeight - Height of viewport
 * @returns Scroll factor for use in parallax calculations
 */
export function getScrollFactor(scrollY: number, viewportHeight: number): number {
  return scrollY / viewportHeight;
}

/**
 * Map a value from one range to another
 * @param value - Value to map
 * @param fromMin - Source range minimum
 * @param fromMax - Source range maximum
 * @param toMin - Target range minimum
 * @param toMax - Target range maximum
 * @returns Mapped value
 */
export function mapRange(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number {
  const normalized = (value - fromMin) / (fromMax - fromMin);
  return toMin + normalized * (toMax - toMin);
}

/**
 * Clamp a value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Easing function: ease-in-out cubic
 * @param t - Normalized time (0-1)
 * @returns Eased value
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Easing function: ease-out cubic
 * @param t - Normalized time (0-1)
 * @returns Eased value
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Calculate parallax offset for creating depth layers
 * @param depth - Depth value (0-1, where 0 = closest, 1 = farthest)
 * @param scrollProgress - Normalized scroll progress
 * @param maxOffset - Maximum offset distance
 * @returns Parallax offset
 */
export function getDepthParallax(
  depth: number,
  scrollProgress: number,
  maxOffset: number = 10
): number {
  // Objects further away (depth closer to 1) move slower
  const speed = 1 - depth * 0.8; // Speed ranges from 1.0 to 0.2
  return scrollProgress * maxOffset * speed;
}
