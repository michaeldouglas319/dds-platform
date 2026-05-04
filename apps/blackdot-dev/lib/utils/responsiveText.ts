/**
 * Responsive text utilities for adaptive typography
 * Provides functions to calculate responsive font sizes, line heights, and text truncation
 */

/**
 * Calculate responsive font size based on viewport
 * @param baseSize - Base font size in pixels
 * @param breakpoint - Current breakpoint ('mobile', 'tablet', 'desktop')
 * @param scale - Additional scaling factor (default: 1)
 * @returns Responsive font size in pixels
 */
export function getResponsiveFontSize(
  baseSize: number,
  breakpoint: 'mobile' | 'tablet' | 'desktop',
  scale: number = 1
): number {
  switch (breakpoint) {
    case 'mobile':
      return baseSize * 0.6 * scale;
    case 'tablet':
      return baseSize * 0.8 * scale;
    case 'desktop':
      return baseSize * scale;
  }
}

/**
 * Calculate responsive line height
 * @param breakpoint - Current breakpoint ('mobile', 'tablet', 'desktop')
 * @returns Line height multiplier
 */
export function getResponsiveLineHeight(breakpoint: 'mobile' | 'tablet' | 'desktop'): number {
  switch (breakpoint) {
    case 'mobile':
      return 1.2;
    case 'tablet':
      return 1.4;
    case 'desktop':
      return 1.6;
  }
}

/**
 * Truncate text for mobile display
 * @param text - Text to potentially truncate
 * @param breakpoint - Current breakpoint ('mobile', 'tablet', 'desktop')
 * @param maxLength - Maximum length for mobile (default: 50)
 * @returns Truncated or original text
 */
export function truncateForMobile(
  text: string,
  breakpoint: 'mobile' | 'tablet' | 'desktop',
  maxLength: number = 50
): string {
  if (breakpoint === 'mobile' && text.length > maxLength) {
    return text.substring(0, maxLength - 3) + '...';
  }
  return text;
}

/**
 * Calculate responsive padding/margin based on breakpoint
 * @param breakpoint - Current breakpoint ('mobile', 'tablet', 'desktop')
 * @param baseUnit - Base unit in pixels (default: 16)
 * @returns Responsive spacing value in pixels
 */
export function getResponsiveSpacing(
  breakpoint: 'mobile' | 'tablet' | 'desktop',
  baseUnit: number = 16
): number {
  switch (breakpoint) {
    case 'mobile':
      return baseUnit * 0.5;
    case 'tablet':
      return baseUnit * 0.75;
    case 'desktop':
      return baseUnit;
  }
}

/**
 * Get responsive text alignment based on content density
 * @param breakpoint - Current breakpoint ('mobile', 'tablet', 'desktop')
 * @returns Text alignment value ('left', 'center', 'right')
 */
export function getResponsiveTextAlignment(
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): 'left' | 'center' | 'right' {
  if (breakpoint === 'mobile') return 'center';
  if (breakpoint === 'tablet') return 'center';
  return 'left';
}

/**
 * Calculate responsive letter spacing for better readability
 * @param breakpoint - Current breakpoint ('mobile', 'tablet', 'desktop')
 * @param baseSpacing - Base letter spacing in em (default: 0.02)
 * @returns Letter spacing value in em
 */
export function getResponsiveLetterSpacing(
  breakpoint: 'mobile' | 'tablet' | 'desktop',
  baseSpacing: number = 0.02
): number {
  switch (breakpoint) {
    case 'mobile':
      return baseSpacing * 1.5;
    case 'tablet':
      return baseSpacing;
    case 'desktop':
      return baseSpacing * 0.8;
  }
}
