/**
 * Soft Guidance Schema
 *
 * Auto-generated UI for physics-based soft constraints.
 * Enables natural variation in particle behavior with gentle corrective forces.
 */

import { z } from 'zod';
import { withMeta, MetaPresets } from '../schema-metadata';

export const SoftGuidanceSchema = z.object({
  enabled: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Enable Soft Guidance',
      description: 'Use soft forces instead of hard position/velocity constraints',
      category: 'toggle'
    }
  ),

  speedVariationTolerance: withMeta(
    z.number().min(0).max(2),
    {
      control: 'slider',
      label: 'Speed Variation Tolerance',
      description: 'Allowed speed deviation from nominal (±% of target speed)',
      unit: 'factor',
      category: 'tolerance',
      min: 0,
      max: 2,
      step: 0.05
    }
  ),

  verticalSoftness: withMeta(
    z.number().min(0).max(1),
    {
      control: 'slider',
      label: 'Vertical Softness',
      description: 'How loosely particles follow vertical wave guidance (0 = rigid, 1 = free)',
      unit: 'factor',
      category: 'softness',
      min: 0,
      max: 1,
      step: 0.05
    }
  ),

  radialComfortZone: withMeta(
    z.number().min(0).max(0.5),
    {
      control: 'slider',
      label: 'Radial Comfort Zone',
      description: 'Percentage of donut thickness with no radial correction (0 = always correct, 0.5 = 50% free zone)',
      unit: 'factor',
      category: 'tolerance',
      min: 0,
      max: 0.5,
      step: 0.05
    }
  ),

  individualVariation: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Enable Individual Variation',
      description: 'Allow per-particle preferences and behavior variations',
      category: 'toggle'
    }
  ),
});

/**
 * TypeScript type inferred from schema
 */
export type SoftGuidanceConfig = z.infer<typeof SoftGuidanceSchema>;

/**
 * Default soft guidance configuration
 */
export const DEFAULT_SOFT_GUIDANCE_CONFIG: SoftGuidanceConfig = {
  enabled: true,
  speedVariationTolerance: 0.15,
  verticalSoftness: 0.4,
  radialComfortZone: 0.2,
  individualVariation: true,
};
