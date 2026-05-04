'use client'

/**
 * useThemeColors Hook
 * Reactive hook that provides theme-aware colors for Three.js
 *
 * Best Practices Applied:
 * - Reactive to theme changes
 * - Performance optimized with caching
 * - SSR-safe
 * - Automatically updates on theme toggle
 */

import { useState, useEffect } from 'react';
import * as THREE from 'three';
import {
  getBackgroundColor,
  getForegroundColor,
  getPrimaryColor,
  getMutedColor,
  isDarkTheme,
  clearColorCache,
} from '../../utils/theme-colors';

export interface ThemeColors {
  background: THREE.Color;
  foreground: THREE.Color;
  primary: THREE.Color;
  muted: THREE.Color;
  isDark: boolean;
}

/**
 * Hook to get theme-aware colors for Three.js materials
 * Automatically updates when theme changes
 *
 * @returns Object containing theme colors and isDark boolean
 */
export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(() => ({
    background: getBackgroundColor(),
    foreground: getForegroundColor(),
    primary: getPrimaryColor(),
    muted: getMutedColor(),
    isDark: isDarkTheme(),
  }));

  useEffect(() => {
    // Update colors function
    const updateColors = () => {
      clearColorCache(); // Clear cache to get fresh colors
      setColors({
        background: getBackgroundColor(),
        foreground: getForegroundColor(),
        primary: getPrimaryColor(),
        muted: getMutedColor(),
        isDark: isDarkTheme(),
      });
    };

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          updateColors();
        }
      });
    });

    // Observe theme changes on document element
    if (typeof document !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  return colors;
}
