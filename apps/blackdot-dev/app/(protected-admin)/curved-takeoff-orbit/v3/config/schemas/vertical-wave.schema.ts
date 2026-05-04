/**
 * Vertical Wave Schema
 *
 * Auto-generated UI for 3D orbital wave motion.
 * Controls vertical oscillation patterns within the donut-shaped orbit.
 */

import { z } from 'zod';
import { withMeta, MetaPresets } from '../schema-metadata';

export const VerticalWaveSchema = z.object({
  enabled: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Enable Vertical Wave',
      description: 'Add vertical oscillation to orbital motion',
      category: 'toggle'
    }
  ),

  amplitudeMultiplier: withMeta(
    z.number().min(0).max(1),
    {
      control: 'slider',
      label: 'Amplitude Multiplier',
      description: 'Multiplier for donut thickness (0-1, affects wave height)',
      unit: 'factor',
      category: 'wave',
      min: 0,
      max: 1,
      step: 0.05
    }
  ),

  frequency: withMeta(
    z.number().min(0.5).max(5),
    {
      control: 'slider',
      label: 'Frequency',
      description: 'Number of vertical waves per complete orbit',
      unit: 'waves/orbit',
      category: 'wave',
      min: 0.5,
      max: 5,
      step: 0.25
    }
  ),

  springConstant: withMeta(
    z.number().min(10).max(200),
    {
      control: 'slider',
      label: 'Spring Constant',
      description: 'Vertical force strength (higher = tighter wave control)',
      unit: 'force',
      category: 'forces',
      min: 10,
      max: 200,
      step: 5
    }
  ),
});

/**
 * TypeScript type inferred from schema
 */
export type VerticalWaveConfig = z.infer<typeof VerticalWaveSchema>;

/**
 * Default vertical wave configuration
 */
export const DEFAULT_VERTICAL_WAVE_CONFIG: VerticalWaveConfig = {
  enabled: true,
  amplitudeMultiplier: 0.6,
  frequency: 2.0,
  springConstant: 50.0,
};
