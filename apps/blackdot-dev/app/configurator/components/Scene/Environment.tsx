'use client';

import { Environment } from '@react-three/drei';
import { useMemo } from 'react';

interface EnvironmentProps {
  type?: 'studio' | 'sunset' | 'warehouse' | 'custom' | 'none';
  intensity?: number;
  blur?: number;
}

/**
 * Environment background for configurator scenes
 * Uses HDRI presets from drei or custom environment setup
 *
 * @category 3d
 * @subcategory lighting
 */
export function EnvironmentBackground({
  type = 'studio',
  intensity = 1.5,
  blur = 0.65,
}: EnvironmentProps) {
  // Environment presets - maps to HDRI files included with drei
  const envPresets = useMemo(
    () => ({
      studio: 'studio',
      sunset: 'sunset',
      warehouse: 'warehouse',
      custom: 'park', // Fallback to park for custom
      none: null,
    }),
    []
  );

  const preset = envPresets[type];

  if (preset === null) {
    // No environment - use plain background
    return null;
  }

  return (
    <Environment
      preset={preset as any}
    />
  );
}
