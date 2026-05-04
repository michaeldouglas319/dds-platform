/**
 * Central Loader Configuration Schema
 *
 * Zod schema for the central test loader displayed in the scene.
 * Exposes all customizable properties through a schema-driven UI.
 */

import { z } from 'zod';
import { withMeta } from '@/app/(protected-admin)/curved-takeoff-orbit/v3/config/schema-metadata';

export const LoaderConfigSchema = z.object({
  // Loader Selection
  loaderType: withMeta(
    z.enum(['Item1', 'Item2', 'Item3', 'Item4', 'Item5', 'Item6', 'Item7', 'Item8', 'Item9', 'Item10', 'Item11', 'Item12']),
    {
      control: 'select',
      label: 'Loader Type',
      description: 'Choose which loader component to display',
      category: 'loader',
      options: [
        { label: 'Item 1 - Rotating Toruses', value: 'Item1' },
        { label: 'Item 2 - Circular Formation', value: 'Item2' },
        { label: 'Item 3', value: 'Item3' },
        { label: 'Item 4', value: 'Item4' },
        { label: 'Item 5 - Cube Grid', value: 'Item5' },
        { label: 'Item 6', value: 'Item6' },
        { label: 'Item 7', value: 'Item7' },
        { label: 'Item 8', value: 'Item8' },
        { label: 'Item 9', value: 'Item9' },
        { label: 'Item 10', value: 'Item10' },
        { label: 'Item 11', value: 'Item11' },
        { label: 'Item 12', value: 'Item12' },
      ],
    }
  ),

  // Material & Lighting
  lightResponsive: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Light Responsive Material',
      description: 'Enable material that responds to particle PointLights (standard material instead of matcap)',
      category: 'material',
    }
  ),

  // Transform & Position
  scale: withMeta(
    z.number().min(0.1).max(3.0),
    {
      control: 'slider',
      label: 'Scale',
      description: 'Size multiplier of the loader',
      unit: 'units',
      category: 'transform',
      min: 0.1,
      max: 3.0,
      step: 0.1,
    }
  ),

  positionY: withMeta(
    z.number().min(-50).max(50),
    {
      control: 'slider',
      label: 'Position Y (Height)',
      description: 'Vertical position in the scene',
      unit: 'units',
      category: 'transform',
      min: -50,
      max: 50,
      step: 1,
    }
  ),

  // Visibility
  visible: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Visible',
      description: 'Show/hide the loader in the scene',
      category: 'visibility',
    }
  ),

  // Advanced Material Tweaks (for light-responsive mode)
  materialSettings: z.object({
    metalness: withMeta(
      z.number().min(0).max(1),
      {
        control: 'slider',
        label: 'Metalness',
        description: 'How metallic the material appears (0 = matte, 1 = mirror)',
        category: 'material',
        min: 0,
        max: 1,
        step: 0.05,
      }
    ),
    roughness: withMeta(
      z.number().min(0).max(1),
      {
        control: 'slider',
        label: 'Roughness',
        description: 'Surface roughness (0 = smooth reflections, 1 = diffuse)',
        category: 'material',
        min: 0,
        max: 1,
        step: 0.05,
      }
    ),
    emissiveIntensity: withMeta(
      z.number().min(0).max(2),
      {
        control: 'slider',
        label: 'Emissive Intensity',
        description: 'Self-illumination strength',
        category: 'material',
        min: 0,
        max: 2,
        step: 0.1,
      }
    ),
  }).optional(),
});

export type LoaderConfig = z.infer<typeof LoaderConfigSchema>;

export const DEFAULT_LOADER_CONFIG: LoaderConfig = {
  loaderType: 'Item5',
  lightResponsive: true,
  scale: 0.5,
  positionY: 15,
  visible: true,
  materialSettings: {
    metalness: 0.3,
    roughness: 0.4,
    emissiveIntensity: 0.5,
  },
};

/**
 * Preset configurations for quick switching
 */
export const LOADER_PRESETS = {
  default: DEFAULT_LOADER_CONFIG,
  minimal: {
    ...DEFAULT_LOADER_CONFIG,
    scale: 0.25,
  } as LoaderConfig,
  prominent: {
    ...DEFAULT_LOADER_CONFIG,
    scale: 1.5,
    materialSettings: {
      metalness: 0.5,
      roughness: 0.2,
      emissiveIntensity: 1.0,
    },
  } as LoaderConfig,
  reflective: {
    ...DEFAULT_LOADER_CONFIG,
    loaderType: 'Item5',
    materialSettings: {
      metalness: 0.9,
      roughness: 0.1,
      emissiveIntensity: 0.3,
    },
  } as LoaderConfig,
  glowing: {
    ...DEFAULT_LOADER_CONFIG,
    loaderType: 'Item1',
    materialSettings: {
      metalness: 0.2,
      roughness: 0.3,
      emissiveIntensity: 1.5,
    },
  } as LoaderConfig,
};
