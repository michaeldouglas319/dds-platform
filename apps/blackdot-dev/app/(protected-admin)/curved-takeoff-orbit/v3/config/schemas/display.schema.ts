/**
 * Display Toggles Schema
 * Auto-generated UI for visibility toggles.
 * Supports multiple particle rendering modes:
 * - 'hidden': No particles visible
 * - 'orb': Glowing PointLight spheres with real-time illumination
 * - 'sphere': Simple emissive spheres (no lighting contribution)
 * - 'hybrid-glow': Cluster follow lights + emissive spheres + bloom (recommended)
 * - 'emissive-bloom': Emissive spheres + bloom only (best performance)
 * - 'model': GLTF airplane models with GPU instancing
 */

import { z } from 'zod';
import { withMeta } from '../schema-metadata';

export const DisplaySchema = z.object({
  // Particle count
  particleCount: withMeta(
    z.number().min(1).max(100),
    {
      control: 'slider',
      label: 'Particle Count',
      description: 'Number of particles to render',
      unit: 'particles',
      category: 'visibility',
      min: 1,
      max: 100,
      step: 1,
    }
  ),

  // Particle display mode
  particleMode: withMeta(
    z.enum(['hidden', 'orb', 'sphere', 'hybrid-glow', 'emissive-bloom', 'model']),
    {
      control: 'select',
      label: 'Particle Display Mode',
      description: 'Choose how particles are rendered: hidden, glowing orbs with lights, simple spheres, hybrid glow, emissive bloom, or GLTF models',
      category: 'visibility',
      options: [
        { label: 'Hidden', value: 'hidden' },
        { label: 'Glowing Orbs (PointLights)', value: 'orb' },
        { label: 'Simple Spheres (Emissive)', value: 'sphere' },
        { label: 'Hybrid Glow (Recommended)', value: 'hybrid-glow' },
        { label: 'Emissive + Bloom (Best Performance)', value: 'emissive-bloom' },
        { label: 'GLTF Models (Airplane)', value: 'model' },
      ]
    }
  ),

  // Orb-specific settings
  orb: z.object({
    lightPower: withMeta(
      z.number().min(1).max(3000),
      {
        control: 'slider',
        label: 'Light Power',
        description: 'Illumination strength per orb',
        unit: 'units',
        category: 'orb',
        min: 1,
        max: 3000,
        step: 50
      }
    ),
    lightDistance: withMeta(
      z.number().min(10).max(500),
      {
        control: 'slider',
        label: 'Light Distance',
        description: 'How far light spreads from orb',
        unit: 'units',
        category: 'orb',
        min: 10,
        max: 500,
        step: 10
      }
    ),
    sphereRadius: withMeta(
      z.number().min(0.05).max(2),
      {
        control: 'slider',
        label: 'Orb Radius',
        description: 'Visual size of the glowing sphere',
        unit: 'units',
        category: 'orb',
        min: 0.05,
        max: 2,
        step: 0.1
      }
    ),
  }).optional(),

  // Hybrid Glow Settings (cluster follow lights + bloom)
  hybridGlow: z.object({
    mainLightCount: withMeta(
      z.number().min(2).max(5),
      {
        control: 'slider',
        label: 'Main Light Count',
        description: 'Number of cluster follow lights (2-5)',
        unit: 'lights',
        category: 'hybrid-glow',
        min: 2,
        max: 5,
        step: 1,
      }
    ),
    mainLightPower: withMeta(
      z.number().min(500).max(5000),
      {
        control: 'slider',
        label: 'Main Light Power',
        description: 'Illumination strength of cluster lights',
        unit: 'power',
        category: 'hybrid-glow',
        min: 500,
        max: 5000,
        step: 100,
      }
    ),
    mainLightDistance: withMeta(
      z.number().min(50).max(300),
      {
        control: 'slider',
        label: 'Light Distance',
        description: 'How far cluster lights spread',
        unit: 'units',
        category: 'hybrid-glow',
        min: 50,
        max: 300,
        step: 10,
      }
    ),
    bloomIntensity: withMeta(
      z.number().min(0.1).max(3),
      {
        control: 'slider',
        label: 'Bloom Intensity',
        description: 'Strength of the bloom glow effect',
        unit: 'intensity',
        category: 'hybrid-glow',
        min: 0.1,
        max: 3,
        step: 0.1,
      }
    ),
    bloomThreshold: withMeta(
      z.number().min(0.1).max(1),
      {
        control: 'slider',
        label: 'Bloom Threshold',
        description: 'Luminance threshold for bloom (lower = more bloom)',
        unit: 'threshold',
        category: 'hybrid-glow',
        min: 0.1,
        max: 1,
        step: 0.1,
      }
    ),
    particleEmissive: withMeta(
      z.number().min(0.1).max(2),
      {
        control: 'slider',
        label: 'Particle Emissive',
        description: 'Particle glow intensity',
        unit: 'intensity',
        category: 'hybrid-glow',
        min: 0.1,
        max: 2,
        step: 0.1,
      }
    ),
    bloomKernelSize: withMeta(
      z.enum(['1', '2', '3', '4', '5']).transform(Number),
      {
        control: 'select',
        label: 'Bloom Kernel Size',
        description: 'Blur spread (higher = more depth layers)',
        category: 'hybrid-glow',
        options: [
          { label: 'Very Small (1)', value: '1' },
          { label: 'Small (2)', value: '2' },
          { label: 'Medium (3)', value: '3' },
          { label: 'Large (4)', value: '4' },
          { label: 'Very Large (5)', value: '5' },
        ]
      }
    ),
    bloomMipmapBlur: withMeta(
      z.boolean(),
      {
        control: 'checkbox',
        label: 'Bloom Layered Blur (3D Effect)',
        description: 'Enable layered blur for 3D bloom warp effect',
        category: 'hybrid-glow',
      }
    ),
  }).optional(),

  // Scene Lighting
  lighting: z.object({
    ambientIntensity: withMeta(
      z.number().min(0).max(1),
      {
        control: 'slider',
        label: 'Ambient Light',
        description: 'Overall scene ambient light intensity',
        unit: 'intensity',
        category: 'lighting',
        min: 0,
        max: 1,
        step: 0.05,
      }
    ),
    directionalIntensity: withMeta(
      z.number().min(0).max(2),
      {
        control: 'slider',
        label: 'Directional Light',
        description: 'Main directional light intensity',
        unit: 'intensity',
        category: 'lighting',
        min: 0,
        max: 2,
        step: 0.1,
      }
    ),
  }).optional(),

  showModels: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Gate Models',
      description: 'Display dynamic source gate entry models',
      category: 'visibility'
    }
  ),

  showStaticObjects: withMeta(
    z.boolean(),
    {
      control: 'checkbox',
      label: 'Show Static Objects',
      description: 'Display static scene objects (buildings, decorations)',
      category: 'visibility'
    }
  ),
});

/**
 * TypeScript type inferred from schema
 */
export type DisplayConfig = z.infer<typeof DisplaySchema>;

/**
 * Default display configuration (hybrid-glow mode for optimal performance)
 */
const DEFAULT_PARTICLE_COUNT = 12;

export const DEFAULT_DISPLAY_CONFIG: DisplayConfig = {
  particleMode: 'orb',
  particleCount: DEFAULT_PARTICLE_COUNT,
  hybridGlow: {
    mainLightCount: DEFAULT_PARTICLE_COUNT,
    mainLightPower: 2000,
    mainLightDistance: 150,
    bloomIntensity: 0.8,
    bloomThreshold: 0.5,
    particleEmissive: 0.8,
    bloomKernelSize: 3,
    bloomMipmapBlur: true,
  },
  lighting: {
    ambientIntensity: 0.15,
    directionalIntensity: 0.5,
  },
  orb: {
    lightPower: 800,
    lightDistance: 100,
    sphereRadius: 0.3,
  },
  showModels: false,
  showStaticObjects: false,
};
