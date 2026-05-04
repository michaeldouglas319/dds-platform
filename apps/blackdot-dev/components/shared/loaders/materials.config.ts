/**
 * Material configuration for loaders
 * Defines primary, secondary, and tertiary matcap textures
 */

export interface MaterialConfig {
  name: string
  url: string
  description: string
}

export const LOADER_MATERIALS: Record<string, MaterialConfig> = {
  primary: {
    name: 'Primary',
    url: '/assets/textures/1.jpeg',
    description: 'Texture 1',
  },
  secondary: {
    name: 'Secondary',
    url: '/assets/textures/2.jpeg',
    description: 'Texture 2',
  },
  tertiary: {
    name: 'Tertiary',
    url: '/assets/textures/3.jpeg',
    description: 'Texture 3',
  },
}

export const MATERIAL_KEYS = ['primary', 'secondary', 'tertiary'] as const
export type MaterialKey = (typeof MATERIAL_KEYS)[number]
