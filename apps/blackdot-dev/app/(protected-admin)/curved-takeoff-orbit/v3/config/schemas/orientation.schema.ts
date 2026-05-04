/**
 * Orientation Schema
 *
 * Controls how particles rotate during flight with 6 different modes.
 * All parameters auto-generate appropriate UI controls (select + sliders).
 */

import { z } from 'zod';
import { withMeta, MetaPresets } from '../schema-metadata';

/**
 * Orientation modes for particle rotation behavior
 */
export const OrientationModeSchema = withMeta(
  z.enum(['tangent', 'radial', 'banking', 'combo', 'tumble', 'fixed']),
  {
    control: 'select',
    label: 'Orientation Mode',
    description: 'How particles rotate during orbital flight',
    category: 'behavior',
    options: [
      { value: 'tangent', label: 'Tangent (face travel direction)' },
      { value: 'radial', label: 'Radial (face orbit center)' },
      { value: 'banking', label: 'Banking (lean into turns)' },
      { value: 'combo', label: 'Combo (tangent + banking)' },
      { value: 'tumble', label: 'Tumble (random rotation)' },
      { value: 'fixed', label: 'Fixed (no rotation)' },
    ]
  }
);

export const OrientationSchema = z.object({
  mode: OrientationModeSchema,

  tangentSmoothing: withMeta(
    z.number().min(0).max(1),
    {
      control: 'slider',
      label: 'Tangent Smoothing',
      description: 'Rotation smoothness (0 = instant snap, 1 = very smooth)',
      unit: 'factor',
      category: 'smoothing',
      min: 0,
      max: 1,
      step: 0.05
    }
  ),

  bankMultiplier: withMeta(
    z.number().min(0).max(2),
    {
      control: 'slider',
      label: 'Bank Multiplier',
      description: 'Banking intensity when particles turn',
      unit: 'factor',
      category: 'banking',
      min: 0,
      max: 2,
      step: 0.1
    }
  ),

  maxBankAngle: withMeta(
    z.number().min(0).max(90),
    {
      control: 'slider',
      label: 'Max Bank Angle',
      description: 'Maximum degrees particles can lean into turns',
      unit: 'degrees',
      category: 'banking',
      min: 0,
      max: 90,
      step: 5
    }
  ),
});

/**
 * TypeScript type inferred from schema
 */
export type OrientationConfig = z.infer<typeof OrientationSchema>;

/**
 * Default orientation configuration
 */
export const DEFAULT_ORIENTATION_CONFIG: OrientationConfig = {
  mode: 'tangent',
  tangentSmoothing: 0.15,
  bankMultiplier: 0.5,
  maxBankAngle: 30,
};
