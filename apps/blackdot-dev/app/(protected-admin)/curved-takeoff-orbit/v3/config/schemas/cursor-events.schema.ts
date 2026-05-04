/**
 * Cursor Events Schema
 *
 * Configuration for pointer interaction with orbiting particles.
 * Controls deflection forces, speed boosts, and visual feedback.
 */

import { z } from 'zod';
import { withMeta } from '../schema-metadata';

export const CursorEventsSchema = z.object({
  // Master toggle
  enabled: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Enable Cursor Events',
      description: 'Allow particles to react to pointer movement during orbit phase',
      category: 'toggle'
    }
  ),

  // Physics parameters
  influenceRadius: withMeta(
    z.number().min(5).max(50),
    {
      control: 'slider',
      label: 'Influence Radius',
      description: 'Distance particles feel cursor effect',
      unit: 'units',
      category: 'forces',
      min: 5,
      max: 50,
      step: 1
    }
  ),

  deflectionStrength: withMeta(
    z.number().min(0).max(200),
    {
      control: 'slider',
      label: 'Deflection Strength',
      description: 'Force pushing particles away from cursor',
      unit: 'force',
      category: 'forces',
      min: 0,
      max: 200,
      step: 5
    }
  ),

  deflectionVariation: withMeta(
    z.number().min(0).max(1),
    {
      control: 'slider',
      label: 'Deflection Variation',
      description: 'Per-particle randomness in deflection force (0 = uniform, 1 = chaotic)',
      unit: 'factor',
      category: 'forces',
      min: 0,
      max: 1,
      step: 0.05
    }
  ),

  speedBoostEnabled: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Enable Speed Boost',
      description: 'Accelerate particles along their velocity direction when near cursor',
      category: 'motion'
    }
  ),

  speedBoostMultiplier: withMeta(
    z.number().min(0).max(1),
    {
      control: 'slider',
      label: 'Speed Boost Multiplier',
      description: 'Speed increase as percentage of nominal orbit speed',
      unit: 'factor',
      category: 'motion',
      min: 0,
      max: 1,
      step: 0.05
    }
  ),

  // Visual feedback
  showPlaceholder: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Cursor Placeholder',
      description: 'Display visual indicator at cursor position',
      category: 'visual'
    }
  ),

  placeholderScale: withMeta(
    z.number().min(0.5).max(3),
    {
      control: 'slider',
      label: 'Placeholder Scale',
      description: 'Size multiplier for visual cursor indicator',
      unit: 'factor',
      category: 'visual',
      min: 0.5,
      max: 3,
      step: 0.1
    }
  ),
});

export type CursorEventsConfig = z.infer<typeof CursorEventsSchema>;

export const DEFAULT_CURSOR_EVENTS_CONFIG: CursorEventsConfig = {
  enabled: true,
  influenceRadius: 20,
  deflectionStrength: 100,
  deflectionVariation: 0.2,
  speedBoostEnabled: true,
  speedBoostMultiplier: -0.1,
  showPlaceholder: true,
  placeholderScale: 8,
};
