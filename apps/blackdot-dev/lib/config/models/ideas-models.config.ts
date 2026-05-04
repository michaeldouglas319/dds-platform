/**
 * Ideas Section Model Configuration
 * Maps each section to a 3D model type and styling
 * Uses simple fallback geometries to replace complex GLTF/GLB models
 *
 * Pattern: Cycles through 4 base geometry types based on index % 4
 * - 0 (building): Box(2, 2, 2) - cube representation
 * - 1 (uav-drone): Box(1.5, 0.5, 1.5) - flat box for drone
 * - 2 (book): Box(1, 1.5, 0.3) - thin box for book
 * - 3 (island): Cone(1, 2, 8) - island/mountain shape
 */

import { ideasSections } from '../content';

export type IdeasModelType = 'building' | 'uav-drone' | 'book' | 'island';

export interface IdeasModelConfig {
  sectionIndex: number;
  sectionId: string;
  sectionTitle: string;
  modelType: IdeasModelType;
  color: string;
}

/**
 * Base model types with their geometry specifications
 */
export const IdeasModelTypes: Record<IdeasModelType, { description: string }> = {
  'building': { description: 'Box geometry - represents infrastructure/building' },
  'uav-drone': { description: 'Flat box geometry - represents drone/aircraft' },
  'book': { description: 'Thin box geometry - represents documentation/knowledge' },
  'island': { description: 'Cone geometry - represents foundation/landscape' },
};

/**
 * Map section indices to their corresponding model configurations
 * Uses modulo to cycle through the 4 base types for sections beyond the first 4
 */
export const ideasInlineModels: IdeasModelConfig[] = ideasSections.map((section, index) => {
  // Determine model type by cycling through 4 base types
  const modelTypeIndex = index % 4;
  const modelTypes: IdeasModelType[] = ['building', 'uav-drone', 'book', 'island'];

  return {
    sectionIndex: index,
    sectionId: section.id,
    sectionTitle: section.title,
    modelType: modelTypes[modelTypeIndex],
    color: section.color || '#4CAF50',
  };
});

/**
 * Get model configuration for a given section index
 * @param index - 0-based section index
 * @returns Model configuration for the section
 */
export function getModelConfigForSection(index: number): IdeasModelConfig {
  const modelConfig = ideasInlineModels[index];
  if (!modelConfig) {
    return {
      sectionIndex: index,
      sectionId: `section-${index}`,
      sectionTitle: `Section ${index}`,
      modelType: 'building',
      color: '#4CAF50',
    };
  }
  return modelConfig;
}
