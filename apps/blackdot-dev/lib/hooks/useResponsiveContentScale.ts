'use client';

import { useMemo } from 'react';
import type { Breakpoint } from './useResponsiveCanvas';

export interface ContentScaleConfig {
  breakpoint: Breakpoint;
  baseScale?: number;
  textScale?: number;
}

export interface ContentScaleValues {
  modelScale: number;
  textScale: number;
  contentDensity: 'compact' | 'medium' | 'full';
  cardSize: 'small' | 'medium' | 'large';
  spacing: number;
}

/**
 * Hook for responsive content scaling based on breakpoint
 * Provides scaling factors for models, text, and layout
 */
export function useResponsiveContentScale(config: ContentScaleConfig): ContentScaleValues {
  return useMemo(() => {
    const breakpoint = config.breakpoint;
    const baseScale = config.baseScale ?? 1;
    const textScale = config.textScale ?? 1;

    switch (breakpoint) {
      case 'mobile':
        return {
          modelScale: baseScale * 0.5,
          textScale: textScale * 0.7,
          contentDensity: 'compact',
          cardSize: 'small',
          spacing: 0.5
        };
      case 'tablet':
        return {
          modelScale: baseScale * 0.75,
          textScale: textScale * 0.85,
          contentDensity: 'medium',
          cardSize: 'medium',
          spacing: 0.75
        };
      case 'desktop':
        return {
          modelScale: baseScale,
          textScale: textScale,
          contentDensity: 'full',
          cardSize: 'large',
          spacing: 1
        };
    }
  }, [config.breakpoint, config.baseScale, config.textScale]);
}
