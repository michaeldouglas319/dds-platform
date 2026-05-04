/**
 * Theme Color Utilities
 * Provides functions to read theme colors from CSS variables
 * Works both inside and outside Canvas components
 */

/**
 * Convert HSL string (e.g., "222.2 84% 4.9%") to RGB hex color
 * Exported for use in Canvas components
 */
export function hslToHex(hslString: string): string {
  const [h, s, l] = hslString.split(' ').map((val, idx) => {
    if (idx === 0) return parseFloat(val); // hue
    return parseFloat(val.replace('%', '')) / 100; // saturation and lightness
  });

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Get a CSS variable value as a color string
 * Falls back to default if variable not found
 * Exported for use in Canvas components
 */
export function getCSSVariableColor(variable: string, fallback: string): string {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(variable).trim();
  
  if (value) {
    // If it's HSL format, convert to hex
    if (value.includes('%')) {
      return hslToHex(value);
    }
    // If it's already a hex/rgb, return as-is
    return value;
  }

  return fallback;
}

/**
 * Check if current theme is dark
 */
export function isDarkTheme(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return document.documentElement.classList.contains('dark');
}

/**
 * Get background color from CSS variable - reads directly from DOM
 * This works inside Canvas since it doesn't rely on React context
 */
export function getBackgroundColor(): string {
  if (typeof window === 'undefined') {
    return '#191920'; // Default dark
  }

  const root = document.documentElement;
  const bgValue = getComputedStyle(root).getPropertyValue('--background').trim();
  
  if (bgValue) {
    return hslToHex(bgValue);
  }

  // Fallback: check if dark class is present
  const isDark = root.classList.contains('dark');
  return isDark ? '#0a0e27' : '#ffffff';
}

/**
 * Get theme-aware foreground color
 */
export function getForegroundColor(): string {
  const isDark = isDarkTheme();
  return getCSSVariableColor('--foreground', isDark ? '#f5f5f5' : '#1a1a1a');
}

/**
 * Get theme-aware muted color
 */
export function getMutedColor(): string {
  const isDark = isDarkTheme();
  return getCSSVariableColor('--muted', isDark ? '#1f2937' : '#f3f4f6');
}

