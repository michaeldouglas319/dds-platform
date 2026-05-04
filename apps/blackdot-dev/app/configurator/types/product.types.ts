/**
 * Type definitions for the product system
 * Defines product metadata, materials, parts, and configurations
 */

export interface MaterialConfig {
  defaultColor: string;
  metalness: number;
  roughness: number;
  emissive?: string;
  emissiveIntensity?: number;
}

export interface PartDefinition {
  name: string;
  label: string;
  visible: boolean;
  meshNames: string[]; // Names of meshes in the glTF model
  color?: string;
}

export interface ProductDefinition {
  id: string;
  name: string;
  description: string;
  modelPath: string;
  thumbnail?: string;
  category?: string;
  defaultScale?: number;
  defaultPosition?: [number, number, number];

  // Material configuration per part
  materials: {
    [partName: string]: MaterialConfig;
  };

  // Parts configuration
  parts: PartDefinition[];

  // Metadata
  tags?: string[];
  featured?: boolean;
}

export interface ProductConfiguration {
  productId: string;
  materials: {
    [partName: string]: MaterialConfig;
  };
  visibility: {
    [partName: string]: boolean;
  };
}

export interface ProductConfigurationState {
  selectedProductId?: string;
  materials: Record<string, Record<string, MaterialConfig>>;
  visibility: Record<string, Record<string, boolean>>;
}
